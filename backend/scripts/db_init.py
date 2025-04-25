import string
import random
from bson import ObjectId
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
import codecs

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB = os.environ.get('MONGO_DB', 'sciqurio_db')
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

# Base directory containing datasets
BASE_DIR = os.environ.get('MEDIA_DIR', "media/videos/")


async def upload_videos():
    # Iterate over all dataset folders in the base directory
    for dataset_name in os.listdir(BASE_DIR):
        dataset_path = os.path.join(BASE_DIR, dataset_name)

        # Skip if it's not a directory
        if not os.path.isdir(dataset_path):
            continue

        # Path to metadata.json
        metadata_file = os.path.join(dataset_path, "metadata.json")

        # Check if metadata.json exists
        if not os.path.exists(metadata_file):
            print(f"Metadata file not found in dataset: {dataset_name}")
            continue

        # Load metadata.json
        with open(metadata_file, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        # Extract description from global_info
        description = metadata.get("global_info", {}).get("description", "No description available")

        # Iterate over all video files in the dataset folder
        for filename in os.listdir(dataset_path):
            if filename.endswith(".mp4"):
                original_path = os.path.join(dataset_name, filename)
                storage_path = os.path.join("media/videos", dataset_name, filename)

                # Prepare video document
                video_document = {
                    "original_path": original_path,
                    "storage_path": storage_path,
                    "metadata": {
                        "description": description,
                        "dataset": dataset_name
                    },
                    "created_at": datetime.utcnow()
                }

                # Insert into MongoDB
                result = await db.videos.insert_one(video_document)
                print(f"Inserted video: {filename} from dataset: {dataset_name}, ID: {result.inserted_id}")


# MongoDB connection (update to use environment variables)
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]


async def insert_mock_propositions():
    """Insert mock propositions into the database."""
    # Fetch a valid video ID from the database
    video = await db.videos.find_one()
    if not video:
        raise Exception("No videos found in the database. Please upload videos first.")

    video_id = video["_id"]  # Use a valid ObjectId from the videos collection
    human_info = [
        {
            "name": '张三',
            "student_id": '12345678',
            "email": "2323@qq.com"
        },
        {
            "name": '李四1',
            "student_id": '187654321',
            "email": "2323214@qq.com"
        },
        {
            "name": '李四2',
            "student_id": '287654321',
            "email": "2323242@qq.com"
        },
        {
            "name": '李四3',
            "student_id": '387654321',
            "email": "2323243@qq.com"
        },
        {
            "name": '李四4',
            "student_id": '487654321',
            "email": "2323244@qq.com"
        },
        {
            "name": '李四5',
            "student_id": '587654321',
            "email": "2323245@qq.com"
        }
    ]

    sample_propositions = [
        {
            "_id": ObjectId(),
            "video_id": video_id,  # Use the valid ObjectId
            "propositions": [
                {
                    "type": random.choice(["Foundational", "Advanced", "Exploratory", "Violating"]),
                    "content": f"Sample content {i}",
                    "justification": f"Sample justification {i}"
                } for i in range(3)
            ],
            "model_info": {
                "name": "qvq-max",
                "prompt_version": "v1.0",
                "temperature": round(random.uniform(0.5, 1.0), 2)
            },
            "human_created": True,
            "human_info": {
                "name": human_info["name"],
                "student_id": human_info["student_id"],
                "email": human_info["email"]
            },
            "created_at": datetime.utcnow()
        }
        for human_info in [random.choice(human_info) for _ in range(20)]
    ]

    await db.propositions.insert_many(sample_propositions)


async def insert_video(video_data):
    """Insert a video into the database."""
    result = await db.videos.insert_one(video_data)
    return result.inserted_id

async def insert_proposition(proposition_data):
    """Insert a proposition into the database."""
    await db.propositions.insert_one(proposition_data)

async def process_props_file(props_path, dataset_name):
    """Process props.json and insert videos and propositions into the database."""
    with codecs.open(props_path, 'r', encoding='utf-8') as f:
        props_data = json.load(f)

    video_id_map = {}
    for key, value in props_data.items():
        video_id = value['video_id']
        description = value['description']['zh']
        video_filename = f"{video_id}.mp4"
        storage_path = os.path.join("media/videos", dataset_name, video_filename)

        # Insert video into the database
        video_data = {
            "original_path": os.path.join(dataset_name, video_filename),
            "storage_path": storage_path,
            "metadata": {
                "description": description,
                "dataset": dataset_name
            },
            "created_at": datetime.utcnow()
        }
        db_video_id = await insert_video(video_data)
        video_id_map[video_id] = db_video_id

    # Insert propositions for each video
    for key, value in props_data.items():
        video_id = value['video_id']
        if video_id in video_id_map:
            db_video_id = video_id_map[video_id]
            description = value['description']['zh']
            prop = value['propositions']
            _type = prop['type']
            _content = prop['Proposition_zh']
            _justification = prop['Difficulty Justification'] if 'Difficulty Justification' in prop else prop['Incorrectness Explanation']
            proposition_data = {
                "video_id": db_video_id,
                "propositions": [
                    {
                        "type": _type,
                        "content": _content,
                        "justification": _justification
                    }
                ],
                "model_info": value['model_info'],
                "human_created": False,
                "human_info": {},
                "created_at": datetime.utcnow()
            }
            await insert_proposition(proposition_data)

async def main():
    base_dir = "/home/chenty/ying.li/sciqurio/backend/media/videos"
    for folder in os.listdir(base_dir):
        folder_path = os.path.join(base_dir, folder)
        if os.path.isdir(folder_path):
            props_path = os.path.join(folder_path, "props.json")
            if os.path.exists(props_path):
                await process_props_file(props_path, folder)

if __name__ == "__main__":
    asyncio.run(main())
