from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

# -------------------------
# Hide PyMongo debug logs
# -------------------------
logging.getLogger("pymongo").setLevel(logging.WARNING)

# -------------------------
# Load environment variables
# -------------------------
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")

# -------------------------
# MongoDB client setup
# -------------------------
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connect=False)

    # Verify connection
    try:
        client.admin.command('ping')
        print("✅ MongoDB connection verified!")
    except Exception as e:
        print("⚠️ MongoDB ping failed:", e)

    # Databases
    vedavana_db = client["vedavana"]
    plant_ecommerce_db = client["plantEcommerce"]

    # Collections
    users_collection = vedavana_db["users"]
    chat_messages_collection = vedavana_db["chat_messages"]
    conversations_collection = vedavana_db["conversations"]
    coupons_collection = vedavana_db["coupons"]
    contact_messages_collection = vedavana_db["contact_messages"]

    plants_collection = plant_ecommerce_db["plants"]
    seeds_collection = plant_ecommerce_db["seeds"]
    skincare_collection = plant_ecommerce_db["skincare"]
    accessories_collection = plant_ecommerce_db["accessories"]
    medicines_collection = plant_ecommerce_db["medicines"]
    purchased_collection = plant_ecommerce_db["purchased"]
    shopping_collection = plant_ecommerce_db["shopping"]

    print("✅ MongoDB setup complete (collections ready to use).")

except Exception as e:
    print("❌ Failed to connect to MongoDB:", e)
    
    # Set collections to None if connection fails
    users_collection = None
    chat_messages_collection = None
    conversations_collection = None
    coupons_collection = None
    contact_messages_collection = None
    plants_collection = None
    seeds_collection = None
    skincare_collection = None
    accessories_collection = None
    medicines_collection = None
    purchased_collection = None
    shopping_collection = None

# -------------------------
# Optional helper
# -------------------------
def get_collection(name):
    """Get a MongoDB collection safely by name."""
    return globals().get(f"{name}_collection", None)
