# routes/orders.py

from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime, timezone, timedelta
from db import (
    users_collection,
    purchased_collection,
    plants_collection,
    seeds_collection,
    skincare_collection,
    accessories_collection,
    medicines_collection,
    client
)

# ✅ Use the real collection name from shippinginfo.py
shopping_info_collection = client["plantEcommerce"]["shopping_info"]

orders_bp = Blueprint("orders_bp", __name__)

def get_collection_by_category(category):
    return {
        'plant': plants_collection,
        'seed': seeds_collection,
        'skincare': skincare_collection,
        'accessory': accessories_collection,
        'medicine': medicines_collection
    }.get(category)

IST = timezone(timedelta(hours=5, minutes=30))

@orders_bp.route('/orders/place', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        email = data.get("email")
        shipping_info = data.get("shippingInfo", {})

        if not user_id or not email:
            return jsonify({"error": "User ID and Email are required"}), 400

        # Validate user
        user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        # 1️⃣ Pull saved shipping & payment data from shopping_info_collection
        saved_info = shopping_info_collection.find_one({"user_id": user_id}) or {}

        payment_info = {
            "paymentMethod": saved_info.get("paymentMethod", ""),
            "cardNumber": saved_info.get("cardNumber", ""),
            "expiryDate": saved_info.get("expiryDate", ""),
            "bankName": saved_info.get("bankName", ""),
            "upiId": saved_info.get("upiId", ""),
            "walletType": saved_info.get("walletType", ""),
            "walletMobile": saved_info.get("walletMobile", ""),
            "isPaid": bool(saved_info.get("isPaid", False))
        }

        # Use saved shipping if not passed in request
        if not shipping_info and saved_info:
            shipping_info = {
                "fullName": saved_info.get("fullName", ""),
                "address": saved_info.get("address", ""),
                "city": saved_info.get("city", ""),
                "postalCode": saved_info.get("postalCode", ""),
                "shippingOption": saved_info.get("shippingOption", "standard")
            }

        # 2️⃣ Fetch purchased products from temp storage
        purchased_doc = purchased_collection.find_one({"user_id": user_id})
        if not purchased_doc or not purchased_doc.get("purchased_products"):
            return jsonify({"error": "No purchased products found"}), 400

        purchased_products = purchased_doc["purchased_products"]

        # 3️⃣ Reduce stock
        for item in purchased_products:
            collection = get_collection_by_category(item.get("category"))
            if collection is None:
                continue

            prod = collection.find_one({"_id": item["product_id"]})
            if prod is None:
                return jsonify({"error": f"Product not found: {item.get('name', 'Unknown')}"}), 404

            if int(prod.get("stock", 0)) < int(item.get("quantity", 0)):
                return jsonify({"error": f"Insufficient stock for {prod['name']}"}), 400

            collection.update_one(
                {"_id": item["product_id"]},
                {"$inc": {"stock": -int(item["quantity"])}}
            )

        # 4️⃣ Sanitize products for storage
        sanitized_products = []
        for p in purchased_products:
            sanitized_products.append({
                "product_id": str(p.get("product_id")),
                "name": p.get("name", ""),
                "image": p.get("image", ""),
                "quantity": int(p.get("quantity", 0)),
                "price": float(p.get("price", 0)),
                "category": p.get("category", ""),
                "purchased_at": p.get("purchased_at").isoformat() if hasattr(p.get("purchased_at"), 'isoformat') else ""
            })

        # 5️⃣ Create full order record
        order_record = {
            "order_id": str(ObjectId()),
            "products": sanitized_products,
            "shipping": shipping_info,
            "payment": payment_info,
            "total_amount": float(sum(p["price"] * p["quantity"] for p in sanitized_products)),
            "status": "Placed",
            "placed_at": datetime.now(IST).isoformat()
        }

        # 6️⃣ Save into user's permanent order history
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"purchased": order_record}}
        )

        # 7️⃣ Clear temp purchase & shopping info
        purchased_collection.update_one(
            {"user_id": user_id},
            {"$set": {"purchased_products": []}}
        )
        shopping_info_collection.delete_one({"user_id": user_id})

        return jsonify({"message": "Order placed successfully", "order": order_record}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to place order: {str(e)}"}), 500
