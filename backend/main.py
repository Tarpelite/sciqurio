from fastapi import FastAPI, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Dict, Any
from random import sample, choice
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

# Import authentication module
from auth import get_current_user

app = FastAPI()

# CORS configuration
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.environ.get("MONGO_DB", "sciqurio_db")
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

# Serve media files
app.mount("/media", StaticFiles(directory="media"), name="media")

# Fetch all videos


@app.get("/api/videos", response_model=List[dict])
async def get_all_videos(user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch all videos from the database."""
    videos = await db.videos.find().to_list(100)
    return [
        {
            "id": str(video["_id"]),
            "original_path": video["original_path"],
            "storage_path": video["storage_path"],
            "description": video["metadata"].get("description", "No description available"),
            "dataset": video["metadata"].get("dataset", "No dataset available"),
        }
        for video in videos]

# Fetch a video by ID


@app.get("/api/videos/{video_id}", response_model=dict)
async def get_video_by_id(video_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch a video's path by its ID."""
    video = await db.videos.find_one({"_id": ObjectId(video_id)})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"id": str(video["_id"]), "original_path": video["original_path"], "storage_path": video["storage_path"]}

# Add a new video


@app.post("/api/videos", response_model=dict)
async def add_video(video: dict, user: Dict[str, Any] = Depends(get_current_user)):
    """Add a new video to the database."""
    result = await db.videos.insert_one(video)
    return {"id": str(result.inserted_id)}

# Fetch a random video's information


@app.get("/api/random_video", response_model=dict)
async def get_random_video(user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch a random video's information, but only if it has at least 2 associated propositions."""

    # First, get all videos that have at least 2 propositions
    # Using aggregation to count propositions per video
    pipeline = [
        {"$group": {
            "_id": "$video_id",
            "count": {"$sum": 1}
        }},
        {"$match": {
            "count": {"$gte": 2}
        }}
    ]

    # Execute the aggregation to get videos with enough propositions
    videos_with_propositions = await db.propositions.aggregate(pipeline).to_list(1000)

    if not videos_with_propositions:
        raise HTTPException(status_code=404, detail="No videos with at least 2 propositions found")

    # Extract the video IDs
    video_ids = [ObjectId(doc["_id"]) for doc in videos_with_propositions]

    # Query the videos collection to get the actual video documents
    eligible_videos = await db.videos.find({"_id": {"$in": video_ids}}).to_list(1000)

    if not eligible_videos:
        raise HTTPException(status_code=404, detail="No eligible videos found")

    # Choose a random video from the list
    random_video = choice(eligible_videos)

    return {
        "video_id": str(random_video["_id"]),
        "storage_path": random_video["storage_path"],
        "description": random_video["metadata"].get("description", "No description available"),
        "dataset": random_video["metadata"].get("dataset", "No dataset available"),
    }

# Fetch all propositions added by a user


@app.get("/api/propositions/user", response_model=List[dict])
async def get_user_propositions(name: str, student_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch all propositions added by a user."""
    propositions = await db.propositions.find({"human_info.name": name, "human_info.student_id": student_id}).to_list(100)
    if not propositions:
        return []
    return [
        {
            "id": str(prop["_id"]),
            "video_id": str(prop["video_id"]),
            "propositions": prop["propositions"],
            "created_at": prop["created_at"]
        }
        for prop in propositions
    ]

# Fetch all propositions


@app.get("/api/propositions/all", response_model=List[dict])
async def get_all_propositions(user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch all propositions from the database."""
    propositions = await db.propositions.find().to_list(100)
    if not propositions:
        return []
    return [
        {
            "id": str(prop["_id"]),
            "video_id": str(prop["video_id"]),
            "propositions": prop["propositions"],
            "created_at": prop["created_at"]
        }
        for prop in propositions
    ]

# Fetch all propositions for a given video ID


@app.get("/api/propositions/{video_id}", response_model=List[dict])
async def get_propositions_by_video_id(video_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch all propositions for a given video ID and return any two."""
    propositions = await db.propositions.find({"video_id": ObjectId(video_id)}).to_list(100)
    if not propositions or len(propositions) < 2:
        raise HTTPException(status_code=404, detail="Not enough propositions found for the given video ID")

    # Randomly select two propositions
    selected_propositions = sample(propositions, 2)
    return [
        {
            "id": str(prop["_id"]),
            "type": prop["propositions"][0]["type"],  # Assuming the first proposition in the list
            "content": prop["propositions"][0]["content"]
        }
        for prop in selected_propositions
    ]

# Add a new proposition


@app.post("/api/propositions", response_model=dict)
async def add_proposition(proposition: dict, user: Dict[str, Any] = Depends(get_current_user)):
    """Add a new proposition to the database."""
    # Validate input
    required_fields = ["video_id", "name", "email", "content", "student_id"]
    for field in required_fields:
        if field not in proposition:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Construct the proposition document
    proposition_document = {
        "video_id": ObjectId(proposition["video_id"]),  # Associate with the provided video ID
        "propositions": [
            {
                "type": "",  # Empty type
                "content": proposition["content"],
                "justification": ""  # Empty justification
            }
        ],
        "model_info": {
            "name": "human",  # Fixed value
            "prompt_version": "",  # Empty
            "temperature": None  # Empty
        },
        "human_created": True,  # Fixed value
        "human_info": {
            "name": proposition["name"],
            "student_id": proposition["student_id"],
            "email": proposition["email"]
        },
        "created_at": datetime.utcnow()  # Current timestamp
    }

    # Insert into the database
    result = await db.propositions.insert_one(proposition_document)
    return {"id": str(result.inserted_id)}

# Fetch all comparisons for a given video ID


@app.get("/api/comparisons/{video_id}", response_model=List[dict])
async def get_comparisons_by_video_id(video_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch all comparisons for a given video ID."""
    comparisons = await db.comparisons.find({"video_id": ObjectId(video_id)}).to_list(100)
    if not comparisons:
        return []
    return [
        {
            "id": str(comp["_id"]),
            "user_id": str(comp["user_id"]),
            "proposition_a": comp["proposition_a"],
            "proposition_b": comp["proposition_b"],
            "selection": comp["selection"],
            "created_at": comp["created_at"]
        }
        for comp in comparisons
    ]

# Add a new comparison


@app.post("/api/comparison", response_model=dict)
async def add_comparison(comparison: dict, user: Dict[str, Any] = Depends(get_current_user)):
    """Add a new comparison to the database."""
    # Validate input
    required_fields = ["proposition_id1", "prososition_id2", "chosen", "reason"]
    for field in required_fields:
        if field not in comparison:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Fetch propositions by their IDs
    proposition_a = await db.propositions.find_one({"_id": ObjectId(comparison["proposition_id1"])})
    proposition_b = await db.propositions.find_one({"_id": ObjectId(comparison["prososition_id2"])})

    if not proposition_a or not proposition_b:
        raise HTTPException(status_code=404, detail="One or both propositions not found")

    # Construct the comparison document
    comparison_document = {
        "video_id": proposition_a["video_id"],  # Assuming both propositions belong to the same video
        "user_id": comparison.get('user_id', str(user.get("id", ""))),  # Get user ID from authenticated user if not provided
        "proposition_a": {
            "id": str(proposition_a["_id"]),
            "source": proposition_a["model_info"]["name"],
            "content": proposition_a["propositions"][0]["content"],
            "type": proposition_a["propositions"][0]["type"]
        },
        "proposition_b": {
            "id": str(proposition_b["_id"]),
            "source": proposition_b["model_info"]["name"],
            "content": proposition_b["propositions"][0]["content"],
            "type": proposition_b["propositions"][0]["type"]
        },
        "selection": {
            "chosen": comparison["chosen"],
            "reason": comparison["reason"]
        },
        "created_at": datetime.utcnow()  # Current timestamp
    }

    # Insert into the database
    result = await db.comparisons.insert_one(comparison_document)
    return {"id": str(result.inserted_id)}

# Fetch comparison details by its ID


@app.get("/api/comparison/{comparison_id}", response_model=dict)
async def get_comparison_by_id(comparison_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch comparison details by its ID."""
    comparison = await db.comparisons.find_one({"_id": ObjectId(comparison_id)})
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")

    return {
        "id": str(comparison["_id"]),
        "video_id": str(comparison["video_id"]),
        "user_id": str(comparison["user_id"]) if comparison["user_id"] else None,
        "proposition_a": comparison["proposition_a"],
        "proposition_b": comparison["proposition_b"],
        "selection": comparison["selection"],
        "created_at": comparison["created_at"]
    }

# Get the leaderboard of users with the most propositions


@app.get("/api/leaderboard", response_model=List[dict])
async def get_leaderboard(user: Dict[str, Any] = Depends(get_current_user)):
    """Get the leaderboard of users with the most propositions."""
    pipeline = [
        {"$group": {
            "_id": {"name": "$human_info.name", "student_id": "$human_info.student_id"},
            "proposition_count": {"$sum": 1}
        }},
        {"$sort": {"proposition_count": -1}},
        {"$limit": 5}
    ]
    leaderboard = await db.propositions.aggregate(pipeline).to_list(5)
    return [
        {
            "key": str(index + 1),
            "rank": index + 1,
            "username": entry["_id"]["name"],
            "points": entry["proposition_count"]
        }
        for index, entry in enumerate(leaderboard)
    ]

# Create a public health endpoint for checking API status without authentication


@app.get("/api/health")
async def health_check():
    """Public endpoint to check if the API is running."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

if __name__ == '__main__':
    uvicorn.run(app=app, host='0.0.0.0', port=8000, log_level="info")
