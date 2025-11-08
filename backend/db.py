from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)  # 5-second timeout
    
    # Connect to vedavana database
    vedavana_db = client["vedavana"]
    users_collection = vedavana_db["users"]
    chat_messages = vedavana_db["chat_messages"]
    conversations = vedavana_db["conversations"]
    coupons_collection = vedavana_db["coupons"]  # Added coupons collection
    contact_messages = vedavana_db["contact_messages"] 
    
    # Connect to plantEcommerce database with separate collections
    plant_ecommerce_db = client["plantEcommerce"]
    plants_collection = plant_ecommerce_db["plants"]
    seeds_collection = plant_ecommerce_db["seeds"]
    skincare_collection = plant_ecommerce_db["skincare"]
    accessories_collection = plant_ecommerce_db["accessories"]
    medicines_collection = plant_ecommerce_db["medicines"]
    purchased_collection = plant_ecommerce_db["purchased"]
    shopping_collection = plant_ecommerce_db["shopping"] # New shopping collection

    
    # Check if collections are empty
    for collection in [
        plants_collection,
        seeds_collection,
        skincare_collection,
        accessories_collection,
        medicines_collection,
        coupons_collection,
        shopping_collection
    ]:
        if collection.count_documents({}) == 0:
            print(f"⚠️ Warning: {collection.name} is empty.")

    print("✅ Connected to MongoDB successfully.")
except Exception as e:
    print("❌ Failed to connect to MongoDB:", e)
    users_collection = None
    chat_messages = None
    conversations = None
    coupons_collection = None 
    contact_messages = None
    plants_collection = None
    seeds_collection = None
    skincare_collection = None
    accessories_collection = None
    medicines_collection = None
    shopping_collection = None
    purchased_collection = None