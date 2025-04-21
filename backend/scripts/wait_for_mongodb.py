import time
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure


def wait_for_mongodb():
    mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
    max_retries = 30
    retry_interval = 2  # seconds

    print(f"Waiting for MongoDB at {mongo_uri}...")

    for attempt in range(max_retries):
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            # The ismaster command is cheap and does not require auth
            client.admin.command('ismaster')
            print("MongoDB is available!")
            return True
        except ConnectionFailure:
            print(f"MongoDB not available yet (attempt {attempt+1}/{max_retries}), retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)

    print("Could not connect to MongoDB after multiple attempts")
    return False


if __name__ == "__main__":
    wait_for_mongodb()
