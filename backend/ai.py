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
        self.api_key = api_key or os.getenv("AZURE_OPENAI_API_KEY", "Api-X-azurefoundry")
        self.api_version = api_version or "2025-01-01-preview"

        # self.azure_endpoint_2 = azure_endpoint or os.getenv("ENDPOINT_URL", "https://ai-kashifalikhan0932471ai853575866361.openai.azure.com/")
        # self.deployment_name_2 = deployment_name or os.getenv("DEPLOYMENT_NAME", "o1")
        # self.api_key_2 = api_key or os.getenv("AZURE_OPENAI_API_KEY", "8Pf91HwvgBNLjJu1svN3sEGF2oVUMNEjvANWndkJPgr5eE1ETrNcJQQJ99BDACHYHv6XJ3w3AAAAACOGRqxd")
        # self.api_version_2 = api_version or "2025-01-01-preview"

        self.azure_endpoint_2 = azure_endpoint or os.getenv("ENDPOINT_URL", "https://Openai-sweden123.openai.azure.com/")
        self.deployment_name_2 = deployment_name or os.getenv("DEPLOYMENT_NAME", "gpt-4o")
        self.api_key_2 = api_key or os.getenv("AZURE_OPENAI_API_KEY", "baac5af7da4f4226b2ef9830f7381901")
        self.api_version_2 = api_version or "2025-01-01-preview"

        # Initialize the Azure OpenAI client with key-based authentication
        self.client = AzureOpenAI(
            azure_endpoint=self.azure_endpoint,
            api_key=self.api_key,
            api_version=self.api_version
        )
        self.client_2 = AzureOpenAI(
            azure_endpoint=self.azure_endpoint_2,
            api_key=self.api_key_2,
            api_version=self.api_version_2
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
    # def generate_time_table(self, user_text: str, file_path: str = None) -> str:
    #     self.system_prompt = {
    #         "role": "system",
    #         "content": """Forget about the previous instruction, Now you are going to work as a work day time estimator, for that i'll give you some text based data or byte64 data about the time table you have to use thata nd give me fullf fledge time which can be estimatedidly utilized by me such as Day, Sleep hour, college hour and make sure that you will send something no matter the inof is fully proviided or not use dummy info if info i less, and give me response in json formet only, and  No extra text, no explanation., here is the example:- [{"day":"Sunday","sleepHours":8,"collegeHours":0,"othersHours":2,"availableHours":14},{"day":"Monday","sleepHours":8,"collegeHours":6,"othersHours":2,"availableHours":8}]"""
    #     }

    #     user_prompt_content = user_text

    #     chat_prompt = [
    #         self.system_prompt,
    #         {
    #             "role": "user",
    #             "content": user_prompt_content
    #         }
    #     ]

    #     completion = self.client.chat.completions.create(
    #         max_tokens=8000,  
    #         temperature=0.1,  
    #         top_p=0.21,  
    #         frequency_penalty=0.02,  
    #         presence_penalty=0.03,
    #         model=self.deployment_name,
    #         messages=chat_prompt
    #     )

    #     return completion.choices[0].message.content
    
    # def generate_exam_info(self, user_text: str, file_path: str = None) -> str:
    #     self.system_prompt = {
    #         "role": "system",
    #         "content": """Forget about the previous instruction, Now you are going to work as a exma info generator, for that i'll give you some text data or byte64 data about the time table you have to use that and give me full fledge info such as Subject, Date_of_exam, Difficulty_level and make sure that you will send something no matter the inof is fully proviided or not use dummy info if info i less, and give me response in json formet only, and No extra text, no explanation., here is the example:- [{subject:"Database Management",date:new Date(2025,5,25),duration:"3 hours",difficulty:3},{subject:"Data Structures",date:new Date(2025,5,28),duration:"3 hours",difficulty:4}]"""
    #     }

    #     user_prompt_content = user_text

    #     chat_prompt = [
    #         self.system_prompt,
    #         {
    #             "role": "user",
    #             "content": user_prompt_content
    #         }
    #     ]

    #     completion = self.client.chat.completions.create(
    #         max_tokens=8000,  
    #         temperature=0.1,  
    #         top_p=0.21,  
    #         frequency_penalty=0.02,  
    #         presence_penalty=0.03,
    #         model=self.deployment_name,
    #         messages=chat_prompt
    #     )

    #     return completion.choices[0].message.content
    
    # def generate_subject_topic_info(self, user_text: str, file_path: str = None) -> str:
    #     self.system_prompt = {
    #         "role": "system",
    #         "content": """Forget about the previous instruction, Now you are going to work as a Subject topic info generator, for that i'll give you some text data or byte64 data about you have to use that to give me full fledge info about there topics and there estimated time to do, such as Subject, Topics_name, Subject_length, Estimated_time_to_learn_in_hour and make sure that you will send something no matter the info is fully proviided or use 5-6 dummy info if info i less, and  give me response in json formet only, and No extra text, no explanation., here is the example:- [{"name":"Database Management","topics":["Introduction to DBMS","Entity Relationship Model","Normalization","SQL Basics","Transactions and Concurrency","Indexing and Query Optimization"],"lengthLevel":"Moderate","estimatedHours":12},{"name":"Data Structures","topics":["Arrays and Linked Lists","Stacks and Queues","Trees and Binary Trees","Graphs","Sorting Algorithms","Searching Algorithms","Hash Tables"],"lengthLevel":"Extensive","estimatedHours":21}]"""
    #     }

    #     user_prompt_content = user_text

    #     chat_prompt = [
    #         self.system_prompt,
    #         {
    #             "role": "user",
    #             "content": user_prompt_content
    #         }
    #     ]

    #     completion = self.client.chat.completions.create(
    #         max_tokens=8000,  
    #         temperature=0.1,  
    #         top_p=0.21,  
    #         frequency_penalty=0.02,  
    #         presence_penalty=0.03,
    #         model=self.deployment_name,
    #         messages=chat_prompt
    #     )

    #     return completion.choices[0].message.content
