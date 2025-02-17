# backend/chat_service.py

import openai
import os
from dotenv import load_dotenv
import json
import traceback

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")  # Preloaded assistant
conversion_assistant_id = os.getenv("CONVERSION_ASSISTANT_ID")  # File-search assistant

openai.api_key = openai_api_key

class AssistantService:
    def __init__(self):
        # Initialize the OpenAI client
        self.client = openai.OpenAI()
        self.assistant_id = assistant_id
        self.file_search_assistant_id = conversion_assistant_id
        self.enhanced_context = None
        self._load_enhanced_context()

        # Configure file search assistant with correct tool type
        try:
            assistant = self.client.beta.assistants.update(
                assistant_id=self.file_search_assistant_id,
                tools=[{"type": "file_search"}],
                instructions="You are an assistant that helps analyze documents. Use the provided files to answer questions. Always reference the source when providing information."
            )
            print(f"File search assistant configured: {assistant.id}")
        except Exception as e:
            print(f"Error configuring file search assistant: {e}")

    def _load_enhanced_context(self):
        try:
            with open('esrs_data/enhanced_report.json', 'r') as file:
                self.enhanced_context = json.load(file)
        except Exception as e:
            print("Error loading enhanced context:", e)
            self.enhanced_context = None

    # ---------------------------------------------
    # Thread creation methods
    # ---------------------------------------------
    def create_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    def create_file_search_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    # ---------------------------------------------
    # Message methods
    # ---------------------------------------------
    def add_user_message(self, thread_id, content):
        return self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=content
        )

    def run_assistant(self, thread_id):
        return self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.assistant_id
        )

    def run_file_search_assistant(self, thread_id):
        return self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.file_search_assistant_id
        )

    def get_latest_assistant_message(self, thread_id):
        messages = self.client.beta.threads.messages.list(thread_id=thread_id, order="desc")
        for message in messages.data:
            if message.role == "assistant":
                content_text = ''
                if isinstance(message.content, list):
                    for item in message.content:
                        if isinstance(item, dict) and item.get('type') == 'text':
                            content_text += item.get('text', {}).get('value', '')
                        elif isinstance(item, str):
                            content_text += item
                elif isinstance(message.content, str):
                    content_text = message.content
                return content_text
        return "No response from assistant"

    async def send_message(self, message: str, thread_id: str, mode: str = "preloaded"):
        """
        Send a message to the assistant and return the response.
        If mode is "preloaded", the original assistant is used.
        Otherwise (e.g. "user_json" or "converted_xbrl"), the file-search assistant is used.
        """
        try:
            print(f"\nSending message in mode {mode}")
            print(f"Thread ID: {thread_id}")
            
            # Add message to thread
            msg = self.add_user_message(thread_id, message)
            print(f"Added user message: {msg.id}")

            # Run appropriate assistant
            if mode == "preloaded":
                print("Using preloaded assistant")
                run = self.run_assistant(thread_id)
            else:
                print(f"Using file search assistant for mode: {mode}")
                run = self.run_file_search_assistant(thread_id)

            print(f"Run status: {run.status}")
            if run.status != "completed":
                return f"Assistant run did not complete. Status: {run.status}"

            # Get messages with detailed logging
            messages = self.client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc",
                limit=1
            )
            
            print(f"Number of messages retrieved: {len(messages.data)}")
            
            if not messages.data:
                print("No messages found in response")
                return "No response received from assistant"

            message = messages.data[0]
            print(f"Message role: {message.role}")
            print(f"Message content type: {type(message.content)}")
            
            if message.role == "assistant":
                if isinstance(message.content, list):
                    for content_item in message.content:
                        print(f"Content item type: {type(content_item)}")
                        if hasattr(content_item, 'text'):
                            print(f"Text value: {content_item.text.value[:100]}...")
                        else:
                            print(f"Raw content item: {content_item}")
                    
                    # Extract text from the first text content
                    text_content = next(
                        (item.text.value for item in message.content 
                         if hasattr(item, 'text')), 
                        "No text content found"
                    )
                    print(f"Final response text: {text_content[:100]}...")
                    return text_content
                else:
                    print(f"Unexpected message content format: {message.content}")
                    return str(message.content)
            else:
                print(f"Unexpected message role: {message.role}")
                return "No assistant response found"

        except Exception as e:
            print(f"Error in send_message: {e}")
            traceback.print_exc()
            return f"Error: {str(e)}"

    # ---------------------------------------------
    # Vector store helper methods
    # ---------------------------------------------
    def create_vector_store(self, name="User Provided Files"):
        # Ensure that the beta vector_store API is available
        if not hasattr(self.client, "beta") or not hasattr(self.client.beta, "vector_stores"):
            raise AttributeError("OpenAI client does not support vector stores in beta API. Please update the package.")
        vector_store = self.client.beta.vector_stores.create(name=name)
        return vector_store

    def upload_files_to_vector_store(self, vector_store_id, file_streams):
        if not hasattr(self.client, "beta") or not hasattr(self.client.beta, "vector_stores"):
            raise AttributeError("OpenAI client does not support vector stores in beta API. Please update the package.")
        file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(
            vector_store_id=vector_store_id,
            files=file_streams
        )
        return file_batch

    def attach_vector_store_to_assistant(self, vector_store_id):
        """Attach vector store to the file search assistant"""
        try:
            # First clear any existing vector stores
            updated = self.client.beta.assistants.update(
                assistant_id=self.file_search_assistant_id,
                tools=[{"type": "file_search"}],
                tool_resources={"file_search": {"vector_store_ids": []}}
            )
            
            # Then attach the new vector store
            updated = self.client.beta.assistants.update(
                assistant_id=self.file_search_assistant_id,
                tools=[{"type": "file_search"}],
                tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}}
            )
            print(f"Vector store {vector_store_id} attached to assistant {self.file_search_assistant_id}")
            return updated
        except Exception as e:
            print(f"Error attaching vector store to assistant: {e}")
            raise

    def attach_vector_store_to_thread(self, thread_id, vector_store_id):
        updated_thread = self.client.beta.threads.update(
            thread_id=thread_id,
            tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}}
        )
        return updated_thread
