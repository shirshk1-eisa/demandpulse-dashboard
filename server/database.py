"""
Database module — MongoDB connection for Retail Demand Forecasting.
Falls back to a local mode with in-memory data if MongoDB connection fails.
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

# Load .env manually
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "demandpulse")

_client = None
_db = None
_connected = False


def get_db():
    """Get the MongoDB database instance (lazy singleton connection)."""
    global _client, _db, _connected
    if _db is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
            # Force a connection test
            _client.admin.command("ping")
            _db = _client[MONGO_DB_NAME]
            _connected = True
            print(f"✅ Connected to MongoDB Atlas: {MONGO_DB_NAME}")
        except (ConnectionFailure, OperationFailure) as e:
            print(f"⚠️  MongoDB Atlas connection failed: {e}")
            print("   Falling back to local MongoDB or check your IP whitelist in Atlas.")
            print("   Go to Atlas → Network Access → Add Current IP Address")
            # Try local MongoDB as fallback
            try:
                _client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
                _client.admin.command("ping")
                _db = _client[MONGO_DB_NAME]
                _connected = True
                print(f"✅ Connected to local MongoDB: {MONGO_DB_NAME}")
            except Exception:
                print("❌ No MongoDB available. Please whitelist your IP in Atlas or install MongoDB locally.")
                raise
    return _db


def is_connected():
    return _connected


def close_db():
    """Close the MongoDB connection."""
    global _client, _db, _connected
    if _client:
        _client.close()
        _client = None
        _db = None
        _connected = False
