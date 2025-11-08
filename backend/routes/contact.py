# routes/contact.py
from flask import Blueprint, request, jsonify
from datetime import datetime
import smtplib
import ssl
from email.message import EmailMessage
import os
from db import contact_messages
from datetime import datetime, timedelta, timezone


contact_bp = Blueprint("contact", __name__)

IST = timezone(timedelta(hours=5, minutes=30))
# Load SMTP credentials
EMAIL_HOST = os.getenv("SMTP_HOST")
EMAIL_PORT = int(os.getenv("SMTP_PORT", 587))
EMAIL_USER = os.getenv("SMTP_USER")
EMAIL_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("SMTP_FROM", EMAIL_USER)


@contact_bp.route("/send", methods=["POST"])
def send_message():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid data"}), 400

        # Save to MongoDB
        message_doc = {
            "name": data.get("name"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "subject": data.get("subject"),
            "message": data.get("message"),
            "created_at": datetime.now(IST) 
        }
        contact_messages.insert_one(message_doc)

        # Send acknowledgment email
        recipient = data.get("email")
        subject = "🌿 Thank You for Contacting VedaVana"
        body = f"""
        Dear {data.get("name")},

        Thank you for reaching out to VedaVana.
        We’ve received your message regarding "{data.get("subject")}" and our team will get back to you within 24 hours.

        🌱 Your wellness journey is important to us.

        Best regards,  
        The VedaVana Team
        """

        msg = EmailMessage()
        msg["From"] = EMAIL_FROM
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.set_content(body)

        context = ssl.create_default_context()
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls(context=context)
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)

        return jsonify({"status": "success", "message": "Message stored and email sent."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
