import os
import base64
from openai import AzureOpenAI
import json

class AzureOpenAIChatClient:
    def __init__(self, 
                 azure_endpoint: str = None,
                 deployment_name: str = None,
                 api_key: str = None,
                 api_version: str = None):
        
        self.azure_endpoint = azure_endpoint or os.getenv("ENDPOINT_URL", "https://ai-kashifalikhan0936507ai654631959203.openai.azure.com/")
        self.deployment_name = deployment_name or os.getenv("DEPLOYMENT_NAME", "gpt-4.1")
        self.api_key = api_key or os.getenv("AZURE_OPENAI_API_KEY", "INSERT_API_KEY_HERE")
        self.api_version = api_version or "2025-01-01-preview"

        self.client = AzureOpenAI(
            azure_endpoint=self.azure_endpoint,
            api_key=self.api_key,
            api_version=self.api_version
        )
                     
    def generate_time_table(self, user_text: str, file_path: str = None) -> str:
        self.system_prompt = {
            "role": "system",
            "content": """You are a smart study timetable planner. Based on the user's input JSON, generate a weekly study schedule in JSON format. Follow these instructions strictly:

Use the actual subject names

Assign study sessions for each day using the provided availableBlocks, fitting in studyBlockDuration (in minutes).

After each session, add a break of breakDuration (in minutes), except after the final study block.

Do not exceed the dailyTargetStudyHours.

Spread subjects fairly across the week (cycle through them).

Exclude the day marked as offDay.

Show exact study and break times (e.g., "20:00–21:30", "21:30–21:50").

Return output as a valid JSON array with entries for each day.

No explanation or extra text—only JSON output.

📤 Output format (example):

json
Copy
Edit
{
  "day": "Monday",
  "sessions": [
    {
      "subject": "Mathematics",
      "startTime": "20:00",
      "endTime": "21:30"
    },
    {
      "break": true,
      "startTime": "21:30",
      "endTime": "21:50"
    },
    {
      "subject": "Science",
      "startTime": "21:50",
      "endTime": "23:20"
    }
  ]
}
"""
        }

        user_prompt_content = user_text

        chat_prompt = [
            self.system_prompt,
            {
                "role": "user",
                "content": user_prompt_content
            }
        ]

        completion = self.client.chat.completions.create(
            max_tokens=8000,  
            temperature=0.1,  
            top_p=0.21,  
            frequency_penalty=0.02,  
            presence_penalty=0.03,
            model=self.deployment_name,
            messages=chat_prompt
        )

        return completion.choices[0].message.content
    def chatbot(self, user_text: str, file_path: str = None) -> str:
        self.system_prompt = {
            "role": "system",
            "content": """ You are a friendly and helpful Study Planner Buddy AI. Your job is to assist users in planning their study schedules, giving learning suggestions, and helping them stay on track with their academic goals.

When a user interacts with you, always start by gathering essential study details:

Which university or school are you studying in?

What course or program are you enrolled in?

What semester or academic term are you in?

How many days are left until your exam or deadline?

Based on this information, provide:

A personalized study plan.

Topic and lecture suggestions.

Study resources and techniques.

Tips based on the academic calendar and course structure.

Encourage the user to ask more study-related questions.

Important Rules:

Only answer study-related questions.

If the user asks something unrelated to their studies, respond:
"I can't help you with that, please ask me anything related to your studies."

Always keep your tone warm, supportive, and focused on academic success.

Your goal is to be the ultimate virtual buddy who makes planning and studying easier for students. """
        }

        user_prompt_content = user_text

        chat_prompt = [
            self.system_prompt,
            {
                "role": "user",
                "content": user_prompt_content
            }
        ]

        completion = self.client.chat.completions.create(
            max_tokens=8000,  
            temperature=0.1,  
            top_p=0.21,  
            frequency_penalty=0.02,  
            presence_penalty=0.03,
            model=self.deployment_name,
            messages=chat_prompt
        )

        return completion.choices[0].message.content
