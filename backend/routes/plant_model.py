from flask import Blueprint, request, jsonify
from sentence_transformers import SentenceTransformer, util
import requests
import torch
import re

search_bp = Blueprint("search_bp", __name__)

# ===== CONFIG =====
API_URL = "https://plant-api-buj0.onrender.com/api/plants"
API_KEY = "mysecretkey123"
MODEL_NAME = "all-MiniLM-L6-v2"   # 🔹 smaller & faster model
BOOST_WEIGHT = 0.4

# ===== LOAD MODEL =====
print("⏳ Loading search model...")
model = SentenceTransformer(MODEL_NAME)
print("✅ Search model loaded.")

# ===== GLOBAL CACHES =====
plants_data = None
plant_embeddings = None

# ===== HELPER FUNCTIONS =====
def fetch_plant_data():
    headers = {"x-api-key": API_KEY}
    response = requests.get(API_URL, headers=headers)
    response.raise_for_status()
    return response.json()

def clean_query(query):
    query = query.lower()
    query = re.sub(r'[^a-z0-9\s]', ' ', query)
    return query.strip()

def tokenize_text(text):
    return set(re.findall(r'\b\w+\b', text.lower()))

def keyword_boost_score(query_tokens, plant):
    relevant_fields = []
    relevant_fields.extend(plant.get("medicinal_properties", []))
    relevant_fields.extend(plant.get("medicinal_uses", []))
    relevant_text = " ".join(relevant_fields).lower()
    plant_tokens = set(re.findall(r'\b\w+\b', relevant_text))
    matches = query_tokens.intersection(plant_tokens)
    return len(matches) / max(len(query_tokens), 1)

def merge_plant_text(plant: dict) -> str:
    def list_to_text(lst):
        return ", ".join(str(i) for i in lst if i)

    text_parts = []
    important_fields = [
        "common_name", "botanical_name", "summary",
        "medicinal_description", "medicinal_uses", "medicinal_properties",
        "cultivation_details", "care_tips"
    ]
    secondary_fields = [
        "physical_characteristics", "soil_type", "water_needs",
        "sun_exposure", "flowering_season", "usage_parts", "other_names",
        "search_tags", "plant_type", "habit", "leaf_type",
        "temperature_range", "native_range", "known_hazards",
        "propagation_methods", "traditional_systems", "other_uses"
    ]

    for _ in range(2):
        for field in important_fields:
            value = plant.get(field)
            if value:
                if isinstance(value, list):
                    text_parts.append(f"{field.replace('_', ' ')}: {list_to_text(value)}")
                else:
                    text_parts.append(f"{field.replace('_', ' ')}: {value}")

    for field in secondary_fields:
        value = plant.get(field)
        if value:
            if isinstance(value, list):
                text_parts.append(f"{field.replace('_', ' ')}: {list_to_text(value)}")
            else:
                text_parts.append(f"{field.replace('_', ' ')}: {value}")

    local_names = plant.get("language_local_names", {})
    if isinstance(local_names, dict) and local_names:
        text_parts.append(f"local names: {', '.join(local_names.values())}")

    return ". ".join(text_parts)

# ===== LAZY LOADING =====
def load_embeddings():
    global plants_data, plant_embeddings
    if plants_data is None or plant_embeddings is None:
        print("⏳ Loading plant data and generating embeddings (first time)...")
        plants_data = fetch_plant_data()
        plant_texts = [merge_plant_text(p) for p in plants_data]
        plant_embeddings = model.encode(plant_texts, convert_to_tensor=True)
        print("✅ Plant embeddings ready.")

# ===== SEARCH ENDPOINT =====
@search_bp.route("/api/search_plants", methods=["POST"])
def search_plants():
    data = request.get_json()
    query = data.get("query", "").strip()
    top_k = int(data.get("top_k", 5))

    if not query:
        return jsonify({"error": "Query is required"}), 400

    load_embeddings()  # 🔹 Only load once when needed

    query_clean = clean_query(query)
    query_tokens = tokenize_text(query_clean)

    query_embedding = model.encode(query_clean, convert_to_tensor=True)
    scores = util.pytorch_cos_sim(query_embedding, plant_embeddings)[0]

    results_with_boost = []
    for idx, plant in enumerate(plants_data):
        base_score = float(scores[idx])
        boost = keyword_boost_score(query_tokens, plant)
        final_score = base_score + BOOST_WEIGHT * boost
        results_with_boost.append((final_score, idx))

    results_with_boost.sort(key=lambda x: x[0], reverse=True)  # 🔹 sort highest first

    matched_plants = []
    for score, idx in results_with_boost[:top_k]:
        plant = plants_data[idx]
        plant["score"] = round(score, 4)
        matched_plants.append(plant)

    return jsonify(matched_plants)
