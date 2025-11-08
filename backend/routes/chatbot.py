from flask import Blueprint, request, jsonify, make_response
from services.chatbot_service import get_gemini_response
from db import chat_messages, conversations
from datetime import datetime

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chatbot", methods=["POST", "OPTIONS"])
def chatbot():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.status_code = 200
        return response

    data = request.get_json()
    if not data or "message" not in data:
        response = jsonify({"response": "Invalid request: no message provided."})
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response, 400

    user_message = data["message"]
    user_email = data.get("email")  # May be None if not logged in

    bot_reply = get_gemini_response(user_message)

    if user_email:
        chat_messages.insert_one({
            "email": user_email,
            "user_message": user_message,
            "bot_reply": bot_reply,
            "timestamp": datetime.utcnow()
        })

    response = jsonify({"response": bot_reply})
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    return response

@chatbot_bp.route("/save-conversation", methods=["POST", "OPTIONS"])
def save_conversation():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.status_code = 200
        return response

    data = request.get_json()
    email = data.get("email")

    if not email:
        response = jsonify({"error": "Email is required."})
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response, 400

    # Fetch all messages for the user from chat_messages
    messages = list(chat_messages.find({"email": email}).sort("timestamp", 1))
    if not messages:
        response = jsonify({"error": "No messages found to save."})
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response, 400

    # Group messages into pairs
    message_pairs = []
    for msg in messages:
        message_pairs.append({
            "user_message": msg["user_message"],
            "bot_reply": msg["bot_reply"] if msg.get("bot_reply") else "No response from bot"
        })

    # Generate title from the first user message (truncate to 50 chars)
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
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response
    except Exception as e:
        response = jsonify({"error": f"Failed to save conversation: {str(e)}"})
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response, 500

@chatbot_bp.route("/chat-history", methods=["GET", "OPTIONS"])
def history():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.status_code = 200
        return response

    email = request.args.get("email")
    if not email:
        response = jsonify({"error": "No email provided"})
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response, 400

    records = list(conversations.find({"email": email}).sort("timestamp", -1))
    history = []
    for r in records:
        history.append({
            "title": r["title"],
            "messages": r["messages"],
            "timestamp": r["timestamp"].isoformat()
        })

    response = jsonify({"conversations": history})
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    return response