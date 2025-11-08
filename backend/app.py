from flask import Flask, jsonify
from flask_cors import CORS
from routes import register_routes

print("✅ Running app.py from:", __file__)

app = Flask(__name__)

# Enable CORS globally with OPTIONS support
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]  # 👈 allow OPTIONS
)

@app.route("/")
def home():
    return jsonify({"message": "🌿 Ayurkosh API is live!"})

@app.route("/test-cors", methods=["GET", "OPTIONS"])
def test_cors():
    return jsonify({"status": "CORS is working!"})

# Register all routes (auth, chatbot, etc.)
register_routes(app)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
