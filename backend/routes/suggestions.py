from flask import Blueprint, request, jsonify, make_response, Response
import requests
import logging
from functools import lru_cache

suggestion_bp = Blueprint("suggestion", __name__)

# --- CONFIGURATION (CORS FIX APPLIED HERE) ---
API_URL = "https://plant-api-buj0.onrender.com/api/plants"
API_KEY = "mysecretkey123" 
HEADERS = {
    "x-api-key": API_KEY
}
# FIX: Include both local and production origins
ALLOWED_ORIGINS = ["http://localhost:5173", "https://ayurkosh.onrender.com"] 
# ---------------------

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- CORS & Helper Functions ----------

def get_cors_origin():
    """Dynamically checks the request origin against allowed origins."""
    origin = request.headers.get('Origin')
    if origin and origin in ALLOWED_ORIGINS:
        return origin
    # Fallback to the first allowed origin if not recognized
    return ALLOWED_ORIGINS[0] 

def set_cors_headers(response, methods="GET, POST, OPTIONS", headers="Content-Type"):
    """Helper to set standard CORS headers on the final response."""
    response.headers.add('Access-Control-Allow-Origin', get_cors_origin())
    response.headers.add('Access-Control-Allow-Methods', methods)
    response.headers.add('Access-Control-Allow-Headers', headers)
    response.headers.add('Access-Control-Max-Age', '86400')
    return response

# ---------- Caching Logic ----------

@lru_cache(maxsize=1)
def fetch_all_plants():
    """Fetch all plants from the external API for suggestion lookup."""
    try:
        logger.info("🔄 Fetching all plants from external API...")
        response = requests.get(API_URL, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        logger.info(f"✅ Fetched {len(data)} plants.")
        return data
    except Exception as e:
        logger.error(f"❌ Error fetching plants: {e}", exc_info=True)
        # Raising the exception ensures we catch it in the endpoint handler
        raise

# ---------- Endpoint with CORS and Error Handling ----------

@suggestion_bp.route("/suggest-plants", methods=["GET", "OPTIONS"])
def suggest_plants():
    # 1. Handle CORS Preflight
    if request.method == 'OPTIONS':
        response = make_response()
        return set_cors_headers(response, methods="GET, OPTIONS", headers="Content-Type"), 200

    query = request.args.get("query", "").strip().lower()
    if not query:
        logger.info("⚠️ No query provided.")
        response = jsonify([])
        # Apply CORS to final response
        return set_cors_headers(response), 200

    try:
        # 2. Fetch and search logic
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
        json_response = jsonify(matches[:10])
        # Apply CORS to final response
        return set_cors_headers(json_response), 200
        
    except Exception as e:
        # 3. Robust Error Handling (Catches 502/Network Errors from fetch_all_plants)
        logger.error(f"❌ Error in suggest_plants endpoint: {e}", exc_info=True)
        error_response = jsonify({"error": "Failed to fetch plant suggestions due to a server or external API error."})
        # Apply CORS to error response
        return set_cors_headers(error_response), 500