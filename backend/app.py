from flask import Flask, jsonify
from flask_cors import CORS
from routes import register_routes

print("✅ Running app.py from:", __file__)

app = Flask(__name__)

# -------------------------
# Enable CORS
# -------------------------
# Allow both local development and live frontend
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",          # local frontend (Vite dev)
        "https://ayurkosh.onrender.com"   # live frontend
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# -------------------------
# Test route
# -------------------------
@app.route("/")
def home():
    return jsonify({"message": "🌿 Ayurkosh API is live!"})

@app.route("/test-cors", methods=["GET", "OPTIONS"])
def test_cors():
    return jsonify({"status": "CORS is working!"})

# -------------------------
# Register your other routes
# -------------------------
register_routes(app)

# -------------------------
# Run the app
# -------------------------
if __name__ == "__main__":
    # Use host="0.0.0.0" for Render
    app.run(debug=True, host="0.0.0.0", port=5000)
