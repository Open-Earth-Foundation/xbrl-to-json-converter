# backend\chat_service.py
import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")  # Original usage
conversion_assistant_id = os.getenv("CONVERSION_ASSISTANT_ID")  # For file-search usage

openai.api_key = openai_api_key

class AssistantService:
    def __init__(self):
        # Initialize the OpenAI client
        self.client = openai.OpenAI()
        self.assistant_id = assistant_id
        self.file_search_assistant_id = conversion_assistant_id

        self.enhanced_context = None
        self._load_enhanced_context()

    def _load_enhanced_context(self):
        try:
            with open('esrs_data/enhanced_report.json', 'r') as file:
                self.enhanced_context = json.load(file)
        except Exception as e:
            print(f"Error loading enhanced context: {e}")
            self.enhanced_context = None

    # ---------------------------------------------
    # Helper to create a "regular" thread with the original assistant
    # ---------------------------------------------
    def create_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    def add_user_message(self, thread_id, content):
        message = self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=content
        )
        return message

    def run_assistant(self, thread_id):
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.assistant_id
        )
        return run

    # ---------------------------------------------
    # Helper to create a thread that references the "file search" assistant
    # ---------------------------------------------
    def create_file_search_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    def run_file_search_assistant(self, thread_id):
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.file_search_assistant_id
        )
        return run

    # ---------------------------------------------
    # Utility: get the last assistant message text
    # ---------------------------------------------
    def get_latest_assistant_message(self, thread_id):
        messages = self.client.beta.threads.messages.list(thread_id=thread_id)
        for message in messages.data:
            if message.role == 'assistant':
                content_text = ''
                if isinstance(message.content, list):
                    for content_item in message.content:
                        if isinstance(content_item, dict) and content_item.get('type') == 'text':
                            content_text += content_item.get('text', {}).get('value', '')
                        elif isinstance(content_item, str):
                            content_text += content_item
                elif isinstance(message.content, str):
                    content_text = message.content
                return content_text
        return None

    # ---------------------------------------------
    # MAIN message processing logic 
    # ---------------------------------------------
    async def process_message(self, message: str, mode: str = "preloaded", thread_id: str = None, use_enhanced_context: bool = False):
        try:
            if use_enhanced_context and self.enhanced_context:
                message = f"{message}\n\nESRS Context: {json.dumps(self.enhanced_context)}"

            self.add_user_message(thread_id, message)

            if mode == "preloaded":
                run = self.run_assistant(thread_id)
            else:
                run = self.run_file_search_assistant(thread_id)

            if run.status == "completed":
                response = self.get_latest_assistant_message(thread_id)
                return response
        except Exception as e:
            print(f"Error processing message: {e}")

    # ---------------------------------------------
    # Vector store helpers
    # ---------------------------------------------
    def create_vector_store(self, name="User Provided Files"):
        vector_store = self.client.beta.vector_stores.create(name=name)
        return vector_store

    def upload_files_to_vector_store(self, vector_store_id, file_streams):
        file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(
            vector_store_id=vector_store_id,
            files=file_streams
        )
        return file_batch

    def attach_vector_store_to_assistant(self, vector_store_id):
        updated = self.client.beta.assistants.update(
            assistant_id=self.file_search_assistant_id,
            tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}}
        )
        return updated

    def attach_vector_store_to_thread(self, thread_id, vector_store_id):
        updated_thread = self.client.beta.threads.update(
            thread_id=thread_id,
            tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}}
        )
        return updated_thread

    async def send_message(self, message: str, thread_id: str):
        """Send a message to the assistant and get the response"""
        try:
            # Add message to thread
            self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )

            # Run the assistant
            run = self.client.beta.threads.runs.create_and_poll(
                thread_id=thread_id,
                assistant_id=self.assistant_id
            )

            # Get messages (newest first)
            messages = self.client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc"
            )

            # Return the assistant's response
            for msg in messages:
                if msg.role == "assistant":
                    return msg.content[0].text.value

            return "No response from assistant"

        except Exception as e:
            print(f"Error in send_message: {e}")
            return f"Error: {str(e)}"
