# chat_service.py

import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")

openai.api_key = openai_api_key

class AssistantService:
    def __init__(self):
        # Initialize the OpenAI client
        self.client = openai.OpenAI()
        self.assistant_id = assistant_id  # Use the existing Assistant ID

    def create_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    def add_user_message(self, thread, content):
        message = self.client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=content
        )
        return message

    def run_assistant(self, thread):
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread.id,
            assistant_id=self.assistant_id
        )
        return run

    def get_latest_assistant_message(self, thread_id):
        messages = self.client.beta.threads.messages.list(thread_id=thread_id)
        # Get the last assistant message
        print(messages)
        for message in reversed(messages.data):
            if message.role == 'assistant':
                content_text = ''
                if isinstance(message.content, list):
                    for content_item in message.content:
                        if content_item['type'] == 'text':
                            content_text += content_item['text']
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

