from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
from db import users_collection, client  # client from db.py

shopping_bp = Blueprint("shopping_bp", __name__)

# New collection to store shipping info
shopping_info_collection = client["plantEcommerce"]["shopping_info"]

@shopping_bp.route("/shopping-info/<user_id>", methods=["GET"])
def get_shipping_info(user_id):
    """Fetch saved shipping info for autofill or fall back to user profile."""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if already saved in shopping_info collection
        shopping_info = shopping_info_collection.find_one({"user_id": user_id})
        if shopping_info:
            return jsonify({
                "fullName": shopping_info.get("fullName", ""),
                "address": shopping_info.get("address", ""),
                "city": shopping_info.get("city", ""),
                "postalCode": shopping_info.get("postalCode", ""),
                "shippingOption": shopping_info.get("shippingOption", "standard"),
            }), 200

        # Fallback to user profile data
        return jsonify({
            "fullName": user.get("fullName", ""),
            "address": user.get("address", ""),
            "city": user.get("city", ""),
            "postalCode": user.get("postalCode", ""),
            "shippingOption": "standard",
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch shipping info: {str(e)}"}), 500


@shopping_bp.route("/shopping-info", methods=["POST"])
def save_shipping_info():
    """Save or update shipping info."""
    try:
        data = request.get_json()
        user_id = data.get("userId")
        email = data.get("email")

        # Required fields check
        if not user_id or not email:
            return jsonify({"error": "User ID and Email are required"}), 400

        # Validate user
        user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        shipping_data = {
            "user_id": user_id,
            "email": email,
            "fullName": data.get("fullName", ""),
            "address": data.get("address", ""),
            "city": data.get("city", ""),
            "postalCode": data.get("postalCode", ""),
            "shippingOption": data.get("shippingOption", "standard"),
            "updated_at": datetime.utcnow(),
        }

        # Save or update in shopping_info collection
        shopping_info_collection.update_one(
            {"user_id": user_id},
            {"$set": shipping_data},
            upsert=True
        )

        # Sync latest address info into user profile
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "fullName": shipping_data["fullName"],
                "address": shipping_data["address"],
                "city": shipping_data["city"],
                "postalCode": shipping_data["postalCode"],
            }}
        )

        return jsonify({"message": "Shipping info saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to save shipping info: {str(e)}"}), 500

@shopping_bp.route("/shopping-info/payment", methods=["POST"])
def save_payment_info():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        email = data.get("email")
        if not user_id or not email:
            return jsonify({"error": "User ID and Email are required"}), 400

        payment_data = {
            "paymentMethod": data.get("paymentMethod"),
            "cardNumber": data.get("cardNumber", ""),
            "expiryDate": data.get("expiryDate", ""),
            "cvv": data.get("cvv", ""),
            "bankName": data.get("bankName", ""),
            "upiId": data.get("upiId", ""),
            "walletType": data.get("walletType", ""),
            "walletMobile": data.get("walletMobile", ""),
            "isPaid": data.get("isPaid", False)
        }

        shopping_info_collection.update_one(
            {"user_id": user_id},
            {"$set": payment_data},
            upsert=True
        )
        return jsonify({"message": "Payment info saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to save payment info: {str(e)}"}), 500
