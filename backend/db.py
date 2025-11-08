from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

# Hide PyMongo debug logs
logging.getLogger("pymongo").setLevel(logging.WARNING)

load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")

try:
    # Lazy connection
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connect=False)

    # Databases
    vedavana_db = client["vedavana"]
    plant_ecommerce_db = client["plantEcommerce"]

    # Collections
    users_collection = vedavana_db["users"]
    chat_messages = vedavana_db["chat_messages"]
    conversations = vedavana_db["conversations"]
    coupons_collection = vedavana_db["coupons"]
    contact_messages = vedavana_db["contact_messages"]

    plants_collection = plant_ecommerce_db["plants"]
    seeds_collection = plant_ecommerce_db["seeds"]
    skincare_collection = plant_ecommerce_db["skincare"]
    accessories_collection = plant_ecommerce_db["accessories"]
    medicines_collection = plant_ecommerce_db["medicines"]
    purchased_collection = plant_ecommerce_db["purchased"]
    shopping_collection = plant_ecommerce_db["shopping"]

    print("✅ MongoDB setup complete (connection will happen on first query).")

except Exception as e:
    print("❌ Failed to connect to MongoDB:", e)
    # Set collections to None
    users_collection = chat_messages = conversations = coupons_collection = contact_messages = None
    plants_collection = seeds_collection = skincare_collection = accessories_collection = medicines_collection = purchased_collection = shopping_collection = None
