from flask import Blueprint, request, jsonify
from sentence_transformers import util
import requests
import torch
import numpy as np
import re
import os
import pickle
import sys # Used for clean logging on startup

search_bp = Blueprint("search_bp", __name__)

# ===== CONFIG =====
API_URL = "https://plant-api-buj0.onrender.com/api/plants"
API_KEY = "mysecretkey123"
HF_API = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-MiniLM-L3-v2"
BOOST_WEIGHT = 0.4

# Calculate path to cached_search_data.pkl (up one level from 'routes')
# This path relies on the .pkl file being in the 'backend' directory.
CACHED_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "cached_search_data.pkl"
)

# ===== GLOBAL CACHE =====
plants_data = None
plant_embeddings = None

# ===== HELPER FUNCTIONS (NOW INCLUDED FOR COMPLETENESS) =====

def fetch_plant_data():
    """Fetches raw plant data from the external API."""
    headers = {"x-api-key": API_KEY}
    response = requests.get(API_URL, headers=headers)
    response.raise_for_status()
    return response.json()

def clean_query(q):
    """Cleans and standardizes the search query."""
    q = q.lower()
    return re.sub(r"[^a-z0-9\s]", " ", q).strip()

def tokenize_text(text):
    """Tokenizes text for keyword matching."""
    return set(re.findall(r"\b\w+\b", text.lower()))

def keyword_boost_score(query_tokens, plant):
    """Calculates a keyword score based on medicinal fields."""
    fields = []
    fields.extend(plant.get("medicinal_properties", []))
    fields.extend(plant.get("medicinal_uses", []))
    txt = " ".join(fields).lower()
    plant_tokens = set(re.findall(r"\b\w+\b", txt))
    return len(query_tokens.intersection(plant_tokens)) / max(len(query_tokens), 1)

def merge_plant_text(plant):
    """Merges all searchable fields into one string, handling mixed types."""
    def list_to_text(lst): return ", ".join(str(i) for i in lst if i)
    text_parts = []
    for k, v in plant.items():
        if isinstance(v, list): v = list_to_text(v)
        # FIX APPLIED HERE: Use map(str, v.values()) to prevent TypeError from floats
        elif isinstance(v, dict): v = ", ".join(map(str, v.values()))
        if v: text_parts.append(f"{k}: {v}")
    return ". ".join(text_parts)

# ===== REMOTE EMBEDDING (FOR QUERY ONLY) =====
def get_remote_embedding(text):
    """Generates a single embedding vector for the user's query."""
    try:
        r = requests.post(HF_API, json={"inputs": text}, timeout=20)
        data = r.json()
        if isinstance(data, list) and len(data) > 0:
            return np.array(data[0], dtype=np.float32)
    except Exception:
        # In a deployment environment, avoid excessive logging for expected errors
        pass 
    return np.zeros(384, dtype=np.float32)

# ===== LOAD DATA (EFFICIENT LOADING) =====
def load_cached_data():
    """Loads pre-calculated plant data and embeddings from the local file."""
    global plants_data, plant_embeddings
    if plants_data is not None and plant_embeddings is not None:
        return
        
    print(f"⏳ Loading cached search data from: {CACHED_DATA_PATH}", file=sys.stderr)
    try:
        with open(CACHED_DATA_PATH, "rb") as f:
            combined_data = pickle.load(f)
            
        plants_data = combined_data["plants_data"]
        # Convert numpy array back to PyTorch tensor
        plant_embeddings = torch.tensor(combined_data["embeddings"]) 
        print(f"✅ Cached data loaded successfully. {len(plants_data)} plants.", file=sys.stderr)
        
    except FileNotFoundError:
        print(f"❌ ERROR: Cached data file not found at {CACHED_DATA_PATH}. Search disabled.", file=sys.stderr)
    except Exception as e:
        print(f"❌ ERROR loading cached data: {e}. Search disabled.", file=sys.stderr)


# ===== SEARCH ENDPOINT =====
@search_bp.route("/api/search_plants", methods=["POST"])
def search_plants():
    data = request.get_json() or {}
    query = data.get("query", "").strip()
    top_k = int(data.get("top_k", 5))
    if not query:
        return jsonify({"error": "Query is required"}), 400

    # Ensure data is loaded (it should be loaded on startup, but this acts as a fallback)
    load_cached_data() 
    
    # Check if data loaded successfully (e.g., if .pkl file was missing)
    if plants_data is None:
        return jsonify({"error": "Server data not ready for search."}), 503

    query_clean = clean_query(query)
    query_tokens = tokenize_text(query_clean)
    
    # Get embedding for the current query (requires API call)
    query_emb = torch.tensor(get_remote_embedding(query_clean)).unsqueeze(0)

    # Perform cosine similarity search (efficient on pre-loaded tensor)
    scores = util.pytorch_cos_sim(query_emb, plant_embeddings)[0] 
    
    results = []
    # Combine semantic score with keyword boost score
    for i, plant in enumerate(plants_data):
        base = float(scores[i])
        boost = keyword_boost_score(query_tokens, plant)
        # Final combined score
        results.append((base + BOOST_WEIGHT * boost, i))

    results.sort(key=lambda x: x[0], reverse=True)
    
    matched = []
    for score, i in results[:top_k]:
        p = plants_data[i].copy() # Use a copy to avoid modifying the cached data
        p["score"] = round(score, 4)
        matched.append(p)

    return jsonify(matched)

# Call the loader once on script import (server startup) to keep the data in memory.
try:
    load_cached_data()
except Exception as e:
    # Log startup error but allow Flask to start if possible
    print(f"Fatal error during initial data load: {e}", file=sys.stderr)