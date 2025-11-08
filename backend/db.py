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
    # Lazy connection: connection happens on first query
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connect=False)

    # Optional: verify connection
    try:
        client.admin.command('ping')
        print("✅ MongoDB connection verified!")
    except Exception as e:
        print("⚠️ MongoDB ping failed:", e)

    # -------------------------
    # Databases
    # -------------------------
    vedavana_db = client["vedavana"]
    plant_ecommerce_db = client["plantEcommerce"]

    # -------------------------
    # Collections dictionary
    # -------------------------
    collections = {
        # Vedavana DB
        "users": vedavana_db["users"],
        "chat_messages": vedavana_db["chat_messages"],
        "conversations": vedavana_db["conversations"],
        "coupons": vedavana_db["coupons"],
        "contact_messages": vedavana_db["contact_messages"],

        # Plant E-commerce DB
        "plants": plant_ecommerce_db["plants"],
        "seeds": plant_ecommerce_db["seeds"],
        "skincare": plant_ecommerce_db["skincare"],
        "accessories": plant_ecommerce_db["accessories"],
        "medicines": plant_ecommerce_db["medicines"],
        "purchased": plant_ecommerce_db["purchased"],
        "shopping": plant_ecommerce_db["shopping"]
    }

    print("✅ MongoDB setup complete (collections ready to use).")

except Exception as e:
    print("❌ Failed to connect to MongoDB:", e)
    collections = {}
    # Optionally create None placeholders for all collections
    collection_names = [
        "users", "chat_messages", "conversations", "coupons", "contact_messages",
        "plants", "seeds", "skincare", "accessories", "medicines", "purchased", "shopping"
    ]
    for name in collection_names:
        collections[name] = None

# -------------------------
# Helper function (optional)
# -------------------------
def get_collection(name):
    """Get a MongoDB collection safely."""
    if name in collections and collections[name]:
        return collections[name]
    else:
        print(f"❌ Collection '{name}' is not available.")
        return None
