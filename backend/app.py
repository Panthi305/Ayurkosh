from flask import Flask, jsonify
from flask_cors import CORS
from routes import register_routes  # this should import all blueprints

print("✅ Running app.py from:", __file__)

app = Flask(__name__)

# ✅ Enable CORS globally (for all endpoints)
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",          # local frontend
        "https://ayurkosh.onrender.com"   # live frontend
    ]}},
    supports_credentials=True
)

@app.route("/")
def home():
    return jsonify({"message": "🌿 Ayurkosh API is live!"})

@app.route("/test-cors", methods=["GET", "OPTIONS"])
def test_cors():
    return jsonify({"status": "CORS is working!"})

# -------------------------
# Register all blueprints/routes
# -------------------------
register_routes(app)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
