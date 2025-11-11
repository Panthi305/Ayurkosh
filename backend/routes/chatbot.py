from flask import Blueprint, request, jsonify, make_response
from services.chatbot_service import get_gemini_response
from db import chat_messages, conversations
from datetime import datetime
from bson.objectid import ObjectId # <-- NECESSARY FOR FIX
from bson.json_util import dumps, loads # <-- NECESSARY FOR FIX

chatbot_bp = Blueprint("chatbot", __name__)
CORS_ORIGIN = "http://localhost:5173"

@chatbot_bp.route("/chatbot", methods=["POST", "OPTIONS"])
def chatbot():
    # CORS Preflight Handler
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.status_code = 200
        return response

    data = request.get_json()
    if not data or "message" not in data:
        response = jsonify({"response": "Invalid request: no message provided."})
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS Verification: Correctly applied
        return response, 400

    user_message = data["message"]
    user_email = data.get("email")

    # This part should be safe and is not modified
    bot_reply = get_gemini_response(user_message)

    if user_email:
        chat_messages.insert_one({
            "email": user_email,
            "user_message": user_message,
            "bot_reply": bot_reply,
            "timestamp": datetime.utcnow()
        })

    response = jsonify({"response": bot_reply})
    response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS Verification: Correctly applied
    return response

@chatbot_bp.route("/save-conversation", methods=["POST", "OPTIONS"])
def save_conversation():
    # CORS Preflight Handler
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.status_code = 200
        return response

    data = request.get_json()
    email = data.get("email")

    if not email:
        response = jsonify({"error": "Email is required."})
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS FIX: Added header to main response
        return response, 400

    # Fetch all messages for the user from chat_messages
    messages = list(chat_messages.find({"email": email}).sort("timestamp", 1))
    if not messages:
        response = jsonify({"error": "No messages found to save."})
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS FIX: Added header to main response
        return response, 400

    # Group messages into pairs (Logic remains correct)
    message_pairs = []
    for msg in messages:
        message_pairs.append({
            "user_message": msg["user_message"],
            "bot_reply": msg["bot_reply"] if msg.get("bot_reply") else "No response from bot"
        })

    title = message_pairs[0]["user_message"][:50] + "..." if len(message_pairs[0]["user_message"]) > 50 else message_pairs[0]["user_message"]

    # Save conversation to conversations collection
    try:
        conversations.insert_one({
            "email": email,
            "title": title,
            "messages": message_pairs,
            "timestamp": datetime.utcnow()
        })

        # Clear chat_messages for this user only after successful save
        chat_messages.delete_many({"email": email})

        response = jsonify({"message": "Conversation saved successfully."})
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS FIX: Added header to main response
        return response
    except Exception as e:
        response = jsonify({"error": f"Failed to save conversation: {str(e)}"})
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS FIX: Added header to main response
        return response, 500

@chatbot_bp.route("/chat-history", methods=["GET", "OPTIONS"])
def history():
    # CORS Preflight Handler
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.status_code = 200
        return response

    email = request.args.get("email")
    if not email:
        response = jsonify({"error": "No email provided"})
        response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS FIX: Added header to main response
        return response, 400

    # --- START of 502/Serialization Fix ---
    # Fetch records and convert MongoDB BSON fields (like ObjectId and datetime) to JSON strings
    records = list(conversations.find({"email": email}).sort("timestamp", -1))
    
    # Use json.loads(dumps()) to safely serialize MongoDB objects, 
    # then load them back into a Python dict/list structure that jsonify can handle.
    serializable_records = loads(dumps(records)) 
    
    history = []
    for r in serializable_records:
        history.append({
            "title": r["title"],
            "messages": r["messages"],
            "timestamp": r["timestamp"] # datetime is now a string thanks to dumps/loads
        })
    # --- END of 502/Serialization Fix ---

    response = jsonify({"conversations": history})
    response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN # <-- CORS FIX: Added header to main response
    return response

# Note: The get_gemini_response and ChatBox.jsx files do not need changes for this issue.