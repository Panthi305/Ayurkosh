
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
)
cart_bp = Blueprint('cart', __name__)

orders_bp = Blueprint("orders_bp", __name__)

def get_collection_by_category(category):
    return {
        'plant': plants_collection,
        'seed': seeds_collection,
        'skincare': skincare_collection,
        'accessory': accessories_collection,
        'medicine': medicines_collection
    }.get(category)

# IST timezone
IST = timezone(timedelta(hours=5, minutes=30))

@orders_bp.route('/orders/place', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        email = data.get("email")
        shipping_info = data.get("shippingInfo", {})
        payment_info = data.get("paymentInfo", {})
        if not user_id or not email:
            return jsonify({"error": "User ID and Email are required"}), 400

        # Verify user exists
        user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        purchased_doc = purchased_collection.find_one({"user_id": user_id})
        if not purchased_doc or not purchased_doc.get("purchased_products"):
            return jsonify({"error": "No purchased products found"}), 400

        purchased_products = purchased_doc["purchased_products"]

        order_timestamp = datetime.now(IST)

        # Verify stock and reduce it properly
        for item in purchased_products:
            collection = get_collection_by_category(item.get("category"))
            if not collection:
                continue

            product = collection.find_one({"_id": item["product_id"]})
            if not product:
                return jsonify({"error": f"Product not found for {item.get('name', 'unknown')}"}), 400

            if product.get("stock", 0) < item.get("quantity", 0):
                return jsonify({"error": f"Insufficient stock for {product.get('name', '')}"}), 400

            collection.update_one(
                {"_id": item["product_id"]},
                {"$inc": {"stock": -item["quantity"]}}
            )

        # Defensive copy and serialization: ensure all fields used are safe types for MongoDB/JSON
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

        order_record = {
            "order_id": str(ObjectId()),
            "products": sanitized_products,
            "shipping": shipping_info if isinstance(shipping_info, dict) else {},
            "payment": payment_info if isinstance(payment_info, dict) else {},
            "total_amount": sum(p["price"] * p["quantity"] for p in sanitized_products),
            "status": "Placed",
            "placed_at": order_timestamp.isoformat()
        }

        # Push order into user's purchased array
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"purchased": order_record}}
        )

        # Clear user's purchased_collection document purchased_products
        purchased_collection.update_one(
            {"user_id": user_id},
            {"$set": {"purchased_products": []}}
        )

        return jsonify({"message": "Order placed successfully", "order": order_record}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to place order: {str(e)}"}), 500



# -------------------------------------------------------------------------------------------------?



@cart_bp.route('/cart', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)

        if not user_id or not email or not product_id:
            return jsonify({"error": "User ID, Email, and Product ID are required"}), 400

        if not isinstance(quantity, int) or quantity < 1:
            return jsonify({"error": "Quantity must be a positive integer"}), 400

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        except Exception as e:
            return jsonify({"error": "Invalid user ID format"}), 400

        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        product = None
        for collection in [plants_collection, seeds_collection, skincare_collection, accessories_collection, medicines_collection]:
            if collection is None:
                continue
            product = collection.find_one({"_id": product_id})
            if product:
                break

        if not product:
            return jsonify({"error": f"Product not found: {product_id}"}), 404

        if product['stock'] < quantity:
            return jsonify({"error": f"Insufficient stock for {product['name']} (Available: {product['stock']})"}), 400

        if "cart" not in user:
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"cart": []}}
            )

        cart_item = {
            "product_id": product_id,
            "category": product['category'],
            "quantity": quantity,
            "added_at": datetime.utcnow()
        }

        existing_item = users_collection.find_one({
            "_id": ObjectId(user_id),
            "cart.product_id": product_id
        })

        if existing_item:
            users_collection.update_one(
                {"_id": ObjectId(user_id), "cart.product_id": product_id},
                {"$inc": {"cart.$.quantity": quantity}}
            )
        else:
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"cart": cart_item}},
                upsert=True
            )

        return jsonify({"message": f"{product['name']} added to cart"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to add to cart: {str(e)}"}), 500

@cart_bp.route('/cart/<user_id>', methods=['GET'])
def get_cart(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"cart": 1})
        if not user:
            return jsonify({"error": "User not found"}), 404
        if "cart" not in user or not user['cart']:
            return jsonify({"cart": []}), 200

        cart_items = []
        for item in user['cart']:
            if not isinstance(item, dict) or 'product_id' not in item or 'category' not in item:
                continue
            collection = get_collection_by_category(item['category'])
            if collection is None:
                continue
            product = collection.find_one({"_id": item['product_id']})
            if not product:
                continue
            cart_items.append({
                "_id": str(product['_id']),
                "name": product.get('name', 'Unknown'),
                "price": product.get('price', 0),
                "image": product.get('image', ''),
                "category": product.get('category', ''),
                "stock": product.get('stock', 0),
                "quantity": item.get('quantity', 0)
            })
        return jsonify({"cart": cart_items}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch cart: {str(e)}"}), 500

@cart_bp.route('/cart', methods=['PUT'])
def update_cart_item():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')
        product_id = data.get('product_id')
        quantity = data.get('quantity')

        if not user_id or not email or not product_id or quantity is None:
            return jsonify({"error": "User ID, Email, Product ID, and quantity are required"}), 400

        if not isinstance(quantity, int) or quantity < 1:
            return jsonify({"error": "Quantity must be a positive integer"}), 400

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        except Exception as e:
            return jsonify({"error": "Invalid user ID format"}), 400

        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        product = None
        for collection in [plants_collection, seeds_collection, skincare_collection, accessories_collection, medicines_collection]:
            if collection is None:
                continue
            product = collection.find_one({"_id": product_id})
            if product:
                break

        if not product:
            return jsonify({"error": f"Product not found: {product_id}"}), 404

        if quantity > product['stock']:
            return jsonify({"error": f"Requested quantity exceeds available stock for {product['name']} (Available: {product['stock']})"}), 400

        result = users_collection.update_one(
            {"_id": ObjectId(user_id), "cart.product_id": product_id},
            {"$set": {"cart.$.quantity": quantity}}
        )

        if result.modified_count == 0:
            return jsonify({"error": "Cart item not found"}), 404
        return jsonify({"message": "Cart updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update cart: {str(e)}"}), 500

@cart_bp.route('/cart', methods=['DELETE'])
def remove_cart_item():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')
        product_id = data.get('product_id')

        if not user_id or not email or not product_id:
            return jsonify({"error": "User ID, Email, and Product ID are required"}), 400

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        except Exception as e:
            return jsonify({"error": "Invalid user ID format"}), 400

        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"cart": {"product_id": product_id}}}
        )

        if result.modified_count == 0:
            return jsonify({"error": "Cart item not found"}), 404
        return jsonify({"message": "Item removed from cart"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to remove item: {str(e)}"}), 500



@cart_bp.route('/cart/checkout', methods=['POST'])
def checkout():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')

        if not user_id or not email:
            return jsonify({"error": "User ID and Email are required"}), 400

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        except Exception:
            return jsonify({"error": "Invalid user ID format"}), 400

        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        user_cart = users_collection.find_one({"_id": ObjectId(user_id)}, {"cart": 1})
        if not user_cart or "cart" not in user_cart or not user_cart['cart']:
            return jsonify({"error": "Cart is empty"}), 400

        # Get or create the purchased document for this user
        purchased_doc = purchased_collection.find_one({"user_id": user_id})

        if not purchased_doc:
            purchased_doc = {
                "user_id": user_id,
                "email": email,
                "purchased_products": []
            }

        purchased_products = purchased_doc.get("purchased_products", [])

        for item in user_cart['cart']:
            if not isinstance(item, dict) or 'product_id' not in item or 'category' not in item:
                continue

            collection = get_collection_by_category(item['category'])
            if collection is None:
                continue

            product = collection.find_one({"_id": item['product_id']})
            if not product:
                continue

            # Check if product already exists in purchased_products array
            existing_product = next((p for p in purchased_products if p['product_id'] == item['product_id']), None)

            if existing_product:
                # Increase the quantity
                existing_product['quantity'] += item['quantity']
                existing_product['purchased_at'] = datetime.utcnow()  # update timestamp
            else:
                purchased_products.append({
                    "product_id": item['product_id'],
                    "name": product.get('name', ''),
                    "image": product.get('image', ''),
                    "quantity": item['quantity'],
                    "price": product.get('price', 0),
                    "category": product.get('category', ''),
                    "purchased_at": datetime.utcnow()
                })

        # Update or insert the user's purchased document
        purchased_collection.update_one(
            {"user_id": user_id},
            {"$set": {"purchased_products": purchased_products}},
            upsert=True
        )

        # Empty the user's cart
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"cart": []}}
        )

        return jsonify({"message": "Purchase completed successfully"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to checkout: {str(e)}"}), 500




# ... (existing imports and code)
@cart_bp.route('/orders/<user_id>', methods=['GET'])
def get_orders(user_id):
    try:
        purchased_doc = purchased_collection.find_one({"user_id": user_id})
        if not purchased_doc or "purchased_products" not in purchased_doc:
            return jsonify({"orders": []}), 200

        return jsonify({"orders": purchased_doc["purchased_products"]}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch orders: {str(e)}"}), 500

    
@cart_bp.route('/orders/update', methods=['PUT'])
def update_order_item():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')
        product_id = data.get('product_id')
        quantity = data.get('quantity')

        if not user_id or not email or not product_id or quantity is None:
            return jsonify({"error": "User ID, Email, Product ID, and quantity are required"}), 400

        if not isinstance(quantity, int) or quantity < 1:
            return jsonify({"error": "Quantity must be a positive integer"}), 400

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        except Exception:
            return jsonify({"error": "Invalid user ID format"}), 400



        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        # Fetch user's purchased document
        purchased_doc = purchased_collection.find_one({"user_id": user_id})
        if not purchased_doc or "purchased_products" not in purchased_doc:
            return jsonify({"error": "No purchased products found"}), 404

        # Find the product in purchased_products array
        updated = False
        for prod in purchased_doc["purchased_products"]:
            if str(prod["product_id"]) == str(product_id):
                prod["quantity"] = quantity
                updated = True
                break

        if not updated:
            return jsonify({"error": "Order item not found"}), 404

        # Update the purchased document
        purchased_collection.update_one(
            {"user_id": user_id},
            {"$set": {"purchased_products": purchased_doc["purchased_products"]}}
        )

        return jsonify({"message": "Order updated successfully"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to update order: {str(e)}"}), 500

    

@cart_bp.route("/orders/remove", methods=["DELETE"])
def remove_order_item():
    try:
        data = request.get_json(force=True)
        user_id = data.get("userId")
        email = data.get("email")
        product_id = data.get("product_id")

        if not user_id or not email or not product_id:
            return jsonify({"error": "Missing required fields"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        purchased_doc = purchased_collection.find_one({"user_id": user_id})
        if not purchased_doc:
            return jsonify({"error": "No purchased products found"}), 404

        product_item = next(
            (p for p in purchased_doc.get("purchased_products", [])
             if str(p["product_id"]) == str(product_id)),
            None
        )
        if not product_item:
            return jsonify({"error": "Product not found in orders"}), 404

        collection = get_collection_by_category(product_item.get("category"))
        if collection is not None:
            collection.update_one(
                {"_id": product_item["product_id"]},
                {"$inc": {"stock": int(product_item.get("quantity", 0))}}
            )

        purchased_collection.update_one(
            {"user_id": user_id},
            {"$pull": {"purchased_products": {"product_id": product_item["product_id"]}}}
        )

        updated_doc = purchased_collection.find_one({"user_id": user_id})
        if updated_doc and not updated_doc.get("purchased_products"):
            purchased_collection.delete_one({"user_id": user_id})

        return jsonify({"message": "Item removed successfully"}), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/orders/confirm', methods=['POST'])
def confirm_order():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')
        shipping_info = data.get('shippingInfo', {})
        payment_method = data.get('paymentMethod', '')

        if not user_id or not email:
            return jsonify({"error": "User ID and Email are required"}), 400

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id), "email": email})
        except Exception as e:
            return jsonify({"error": "Invalid user ID format"}), 400

        if not user:
            return jsonify({"error": "User not found or email mismatch"}), 404

        # Find all purchased items for the user
        purchased_items = list(purchased_collection.find({"user_id": user_id}))
        if not purchased_items:
            return jsonify({"error": "No purchased items found"}), 400

        # Update purchased items with shipping and payment details
        result = purchased_collection.update_many(
            {"user_id": user_id},
            {
                "$set": {
                    "shipping_info": shipping_info,
                    "payment_method": payment_method,
                    "status": "confirmed",
                    "confirmed_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "No purchased items updated"}), 400

        return jsonify({"message": "Order confirmed successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to confirm order: {str(e)}"}), 500
    
