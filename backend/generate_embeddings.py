import requests
import numpy as np
import pickle # Used to save data structure
import os

# --- Configuration (Must match plant_model.py) ---
API_URL = "https://plant-api-buj0.onrender.com/api/plants"
API_KEY = "mysecretkey123"
HF_API = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-MiniLM-L3-v2"

# --- Helper Functions (Copied from plant_model.py) ---
def fetch_plant_data():
    headers = {"x-api-key": API_KEY}
    response = requests.get(API_URL, headers=headers)
    response.raise_for_status()
    return response.json()

# In generate_embeddings.py (and plant_model.py if the function is duplicated)

def merge_plant_text(plant):
    def list_to_text(lst): return ", ".join(str(i) for i in lst if i)
    text_parts = []
    for k, v in plant.items():
        if isinstance(v, list): v = list_to_text(v)
        # 💡 FIX IS HERE: Use map(str, v.values()) to ensure all values are strings
        elif isinstance(v, dict): v = ", ".join(map(str, v.values()))
        if v: text_parts.append(f"{k}: {v}")
    return ". ".join(text_parts)

def get_remote_embedding(text):
    try:
        r = requests.post(HF_API, json={"inputs": text}, timeout=30) # Increased timeout
        data = r.json()
        if isinstance(data, list):
            return np.array(data[0], dtype=np.float32)
    except Exception as e:
        print(f"⚠️ Embedding error for text: '{text[:50]}...':", e)
    return np.zeros(384, dtype=np.float32)

# --- Main Logic ---
def generate_and_save_embeddings():
    print("Step 1: Fetching all plant data...")
    plants_data = fetch_plant_data()
    print(f"✅ Fetched {len(plants_data)} plants.")
    
    # Merge text for embedding generation
    texts = [merge_plant_text(p) for p in plants_data]

    print("Step 2: Generating remote embeddings (This might take a while)...")
    embeddings = [get_remote_embedding(t) for t in texts]
    
    # Combine the data for saving
    combined_data = {
        "plants_data": plants_data,
        "embeddings": np.stack(embeddings).astype(np.float32) # Ensure correct dtype
    }
    
    # Save the combined data using pickle (more efficient for complex objects)
    SAVE_PATH = os.path.join(os.path.dirname(__file__), "cached_search_data.pkl")
    with open(SAVE_PATH, "wb") as f:
        pickle.dump(combined_data, f)
        
    print(f"\n✨ SUCCESS! Data saved to: {SAVE_PATH}")
    print(f"Total plants saved: {len(combined_data['plants_data'])}")
    print(f"Embeddings shape: {combined_data['embeddings'].shape}")

if __name__ == "__main__":
    generate_and_save_embeddings()