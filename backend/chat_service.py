# chat_service.py

import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")

openai.api_key = openai_api_key

class AssistantService:
    def __init__(self):
        # Initialize the OpenAI client
        self.client = openai.OpenAI()
        self.assistant_id = assistant_id  # Use the existing Assistant ID
        self.enhanced_context = None
        self._load_enhanced_context()

    def _load_enhanced_context(self):
        try:
            with open('esrs_data/enhanced_report.json', 'r') as file:
                self.enhanced_context = json.load(file)
        except Exception as e:
            print(f"Error loading enhanced context: {e}")
            self.enhanced_context = None

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

    def get_latest_assistant_message(self, thread_id):
        messages = self.client.beta.threads.messages.list(thread_id=thread_id)
        # Print message IDs and roles for debugging
        print("Messages in thread:")
        for msg in messages.data:
            print(f"Message ID: {msg.id}, Role: {msg.role}")

        # Assuming messages.data is ordered from newest to oldest
        for message in messages.data:
            if message.role == 'assistant':
                content_text = ''
                if isinstance(message.content, list):
                    for content_item in message.content:
                        print(f"content_item: {content_item}")
                        print(f"type(content_item): {type(content_item)}")
                        if hasattr(content_item, 'type') and content_item.type == 'text':
                            content_text += content_item.text.value
                        elif isinstance(content_item, dict) and content_item.get('type') == 'text':
                            content_text += content_item.get('text', {}).get('value', '')
                        elif isinstance(content_item, str):
                            content_text += content_item
                        else:
                            # Handle other content types if necessary
                            pass
                elif isinstance(message.content, str):
                    content_text = message.content
                else:
                    # Handle unexpected format
                    content_text = str(message.content)
                return content_text
        return None

    async def process_message(self, message: str, thread_id: str = None, use_enhanced_context: bool = False):
        try:
            if use_enhanced_context and self.enhanced_context:
                message = f"{message}\n\nESRS Context: {json.dumps(self.enhanced_context)}"
            
            # Rest of your existing process_message code
        except Exception as e:
            print(f"Error processing message: {e}")
