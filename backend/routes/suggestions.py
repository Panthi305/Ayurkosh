from flask import Blueprint, request, jsonify
import requests
import logging
from functools import lru_cache

suggestion_bp = Blueprint("suggestion", __name__)

API_URL = "https://plant-api-buj0.onrender.com/api/plants"
API_KEY = "mysecretkey123"  # Use secure storage in production

HEADERS = {
    "x-api-key": API_KEY
}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def fetch_all_plants():
    try:
        logger.info("🔄 Fetching all plants from external API...")
        response = requests.get(API_URL, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        logger.info(f"✅ Fetched {len(data)} plants.")
        return data
    except Exception as e:
        logger.error(f"❌ Error fetching plants: {e}")
        return []

@suggestion_bp.route("/suggest-plants", methods=["GET"])
def suggest_plants():
    query = request.args.get("query", "").strip().lower()
    if not query:
        logger.info("⚠️ No query provided.")
        return jsonify([])

    all_plants = fetch_all_plants()
    logger.info(f"🔍 Searching prefix-matching suggestions for: '{query}'")

    matches = [] 
    for plant in all_plants:
        common = plant.get("common_name", "").lower()
        botanical = plant.get("botanical_name", "").lower()
        if common.startswith(query) or botanical.startswith(query):
            matches.append({
                "common_name": plant.get("common_name", ""),
                "botanical_name": plant.get("botanical_name", "")
            })

    logger.info(f"✅ Found {len(matches)} matching plants.")
    return jsonify(matches[:10])  # Return top 10
