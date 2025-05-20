import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId

class MongoDBHandler:
    def __init__(self):
        self.atlas_connection_string = "mongodb+srv://deepak2004verma:tdLWv3bwCnTMaEnq@cluster0.dfzv5ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        self.client = MongoClient(self.atlas_connection_string)
        self.db = self.client["study_schedule_db"]
        self.collection = self.db["user_schedules"]

    def save_info_in_data(self, username, schedule_data,user_id):
        document = {
            "user_id": user_id,
            "username": username,
            "schedule": schedule_data
        }
        result = self.collection.insert_one(document)
        print(f"Schedule saved for user '{username}' with user_id: {user_id}")
        print(f"MongoDB generated _id: {result.inserted_id}")  # This is the ObjectId MongoDB created
        return str(result.inserted_id), user_id

    def fetch_info_data(self, mongo_id_str):
        try:
            obj_id = ObjectId(mongo_id_str)
        except Exception as e:
            print(f"Invalid MongoDB ObjectId: {mongo_id_str}. Error: {e}")
            return None

        document = self.collection.find_one({"_id": obj_id})
        if document:
            return document
        else:
            print(f"No document found with _id: {mongo_id_str}")
            return None

    def fetch_by_user_id(self, user_id):
        document = self.collection.find_one({"user_id": user_id})
        if document:
            return document
        else:
            print(f"No document found with user_id: {user_id}")
            return None
    
    def delete_info_data(self, mongo_id_str):
        try:
            obj_id = ObjectId(mongo_id_str)
        except Exception as e:
            print(f"Invalid MongoDB ObjectId: {mongo_id_str}. Error: {e}")
            return None
        result = self.collection.delete_one({"_id": obj_id})
        if result.deleted_count == 1:
            print(f"Successfully deleted document with _id: {mongo_id_str}")
            return True
        else:
            print(f"No document found to delete with _id: {mongo_id_str}")
            return False
