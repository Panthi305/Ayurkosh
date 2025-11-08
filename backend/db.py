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

    # Vedavana DB collections
    users_collection = vedavana_db["users"]
    chat_messages = vedavana_db["chat_messages"]
    conversations = vedavana_db["conversations"]
    coupons_collection = vedavana_db["coupons"]
    contact_messages_collection = vedavana_db["contact_messages"]

    # Plant E-commerce DB collections
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
    
    # If connection fails, set collections to None
    users_collection = None
    chat_messages = None
    conversations = None
    coupons_collection = None
    contact_messages_collection = None
    plants_collection = None
    seeds_collection = None
    skincare_collection = None
    accessories_collection = None
    medicines_collection = None
    purchased_collection = None
    shopping_collection = None

# Optional helper function
def get_collection(name):
    """Return a collection by variable name, e.g., 'users_collection'"""
    return globals().get(name, None)
