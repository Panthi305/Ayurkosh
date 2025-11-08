from flask import Blueprint, request, jsonify
from sentence_transformers import util
import requests
import torch
import numpy as np
import re

search_bp = Blueprint("search_bp", __name__)

# ===== CONFIG =====
API_URL = "https://plant-api-buj0.onrender.com/api/plants"
API_KEY = "mysecretkey123"
HF_API = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-MiniLM-L3-v2"
BOOST_WEIGHT = 0.4

# ===== GLOBAL CACHE =====
plants_data = None
plant_embeddings = None

# ===== HELPERS =====
def fetch_plant_data():
    headers = {"x-api-key": API_KEY}
    response = requests.get(API_URL, headers=headers)
    response.raise_for_status()
    return response.json()

def clean_query(q):
    q = q.lower()
    return re.sub(r"[^a-z0-9\s]", " ", q).strip()

def tokenize_text(text):
    return set(re.findall(r"\b\w+\b", text.lower()))

def keyword_boost_score(query_tokens, plant):
    fields = []
    fields.extend(plant.get("medicinal_properties", []))
    fields.extend(plant.get("medicinal_uses", []))
    txt = " ".join(fields).lower()
    plant_tokens = set(re.findall(r"\b\w+\b", txt))
    return len(query_tokens.intersection(plant_tokens)) / max(len(query_tokens), 1)

def merge_plant_text(plant):
    def list_to_text(lst): return ", ".join(str(i) for i in lst if i)
    text_parts = []
    for k, v in plant.items():
        if isinstance(v, list): v = list_to_text(v)
        elif isinstance(v, dict): v = ", ".join(v.values())
        if v: text_parts.append(f"{k}: {v}")
    return ". ".join(text_parts)

# ===== REMOTE EMBEDDING =====
def get_remote_embedding(text):
    try:
        r = requests.post(HF_API, json={"inputs": text}, timeout=20)
        data = r.json()
        if isinstance(data, list):
            return np.array(data[0], dtype=np.float32)
    except Exception as e:
        print("⚠️ Embedding error:", e)
    return np.zeros(384, dtype=np.float32)

# ===== LOAD DATA (ON DEMAND) =====
def load_embeddings():
    global plants_data, plant_embeddings
    if plants_data is not None and plant_embeddings is not None:
        return
    print("⏳ Loading plant data & generating remote embeddings...")
    plants_data = fetch_plant_data()
    texts = [merge_plant_text(p) for p in plants_data]
    embeddings = [get_remote_embedding(t) for t in texts]
    plant_embeddings = torch.tensor(np.stack(embeddings))
    print("✅ Embeddings cached in memory.")

# ===== SEARCH =====
@search_bp.route("/api/search_plants", methods=["POST"])
def search_plants():
    data = request.get_json() or {}
    query = data.get("query", "").strip()
    top_k = int(data.get("top_k", 5))
    if not query:
        return jsonify({"error": "Query is required"}), 400

    load_embeddings()

    query_clean = clean_query(query)
    query_tokens = tokenize_text(query_clean)
    query_emb = torch.tensor(get_remote_embedding(query_clean)).unsqueeze(0)

    scores = util.pytorch_cos_sim(query_emb, plant_embeddings)[0]
    results = []
    for i, plant in enumerate(plants_data):
        base = float(scores[i])
        boost = keyword_boost_score(query_tokens, plant)
        results.append((base + BOOST_WEIGHT * boost, i))

    results.sort(key=lambda x: x[0], reverse=True)
    matched = []
    for score, i in results[:top_k]:
        p = plants_data[i]
        p["score"] = round(score, 4)
        matched.append(p)

    return jsonify(matched)
