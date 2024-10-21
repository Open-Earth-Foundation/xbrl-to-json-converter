# chat_service.py
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

openai.api_key = openai_api_key

def process_user_req(user_text, json_data=None):
    # Build the messages for the chat completion
    messages = []
    if json_data:
        # Include the uploaded data in the system prompt
        system_prompt = "You are an assistant with access to the following data: " + str(json_data)
        messages.append({"role": "system", "content": system_prompt})

    messages.append({"role": "user", "content": user_text})
    client = OpenAI()

    completion = client.chat.completions.create(
        model="gpt-4o-mini",  
        messages=messages
    )
    # Return the assistant's reply content as a string
    return completion.choices[0].message.content
