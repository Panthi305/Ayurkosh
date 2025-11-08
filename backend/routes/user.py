from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import users_collection
from bson.objectid import ObjectId
from db import plants_collection, seeds_collection, skincare_collection, accessories_collection, medicines_collection
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from pymongo import UpdateOne

IST = timezone(timedelta(hours=5, minutes=30))

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        full_name = data.get("fullName")
        email = data.get("email")
        password = data.get("password")

        if not full_name or not email or not password:
            return jsonify({"error": "Full Name, Email, and Password are required."}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"error": "Email already exists."}), 400

        hashed_password = generate_password_hash(password)

        # New user will also have address and pincode fields set to empty
        result = users_collection.insert_one({
            "fullName": full_name,
            "username": "",
            "email": email,
            "phone": "",
            "address": "",
            "city": "",
            "postalCode": "",
            "profileImage": "",
            "password": hashed_password,
            "cart": [],
            "purchased": []
        })

        return jsonify({
            "message": "Signup successful.",
            "userId": str(result.inserted_id),
            "email": email
        }), 201
    except Exception as e:
        print("Error in signup:", e)
        return jsonify({"error": "Server error during signup."}), 500


@user_routes.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and Password are required."}), 400

        user = users_collection.find_one({"email": email})
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password."}), 401

        return jsonify({
            "message": "Login successful.",
            "userId": str(user["_id"]),
            "email": user["email"],
            "fullName": user.get("fullName", ""),
            "username": user.get("username", ""),
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "city": user.get("city", ""),
            "postalCode": user.get("postalCode", ""),
            "profileImage": user.get("profileImage", "")
        }), 200
    except Exception as e:
        print("Error in login:", e)
        return jsonify({"error": "Server error during login."}), 500


@user_routes.route("/update_profile", methods=["PUT"])
def update_profile():
    try:
        data = request.get_json()
        user_id = data.get("userId")

        if not user_id:
            return jsonify({"error": "User ID is required."}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found."}), 404

        update_data = {}

        # Include address and pincode here
        for field in ["fullName", "username", "email", "phone", "address", "city", "postalCode", "profileImage"]:
            if data.get(field) is not None:
                update_data[field] = data[field]

        # Optional password update
        if data.get("currentPassword") or data.get("newPassword") or data.get("confirmPassword"):
            if not data.get("currentPassword") or not data.get("newPassword") or not data.get("confirmPassword"):
                return jsonify({"error": "All password fields are required to change password."}), 400
            if not check_password_hash(user["password"], data["currentPassword"]):
                return jsonify({"error": "Current password is incorrect."}), 401
            if data["newPassword"] != data["confirmPassword"]:
                return jsonify({"error": "New passwords do not match."}), 400
            update_data["password"] = generate_password_hash(data["newPassword"])

        if update_data:
            users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

        return jsonify({"message": "Profile updated successfully."})
    except Exception as e:
        print("Update error:", e)
        return jsonify({"error": "Server error during profile update."}), 500


@user_routes.route("/save_plant", methods=["POST"])
def save_plant():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        plant = data.get("plant")  # full plant details

        if not user_id or not plant:
            return jsonify({"error": "User ID and plant data are required."}), 400

        # Ensure savedPlants field exists
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"savedPlants": plant}}  # addToSet prevents duplicates
        )

        return jsonify({"message": "Plant saved successfully."})
    except Exception as e:
        print("Save plant error:", e)
        return jsonify({"error": "Server error while saving plant."}), 500


@user_routes.route("/unsave_plant", methods=["POST"])
def unsave_plant():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        common_name = data.get("common_name")

        if not user_id or not common_name:
            return jsonify({"error": "User ID and common name are required."}), 400

        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"savedPlants": {"common_name": common_name}}}
        )

        return jsonify({"message": "Plant unsaved successfully."})
    except Exception as e:
        print("Unsave plant error:", e)
        return jsonify({"error": "Server error while unsaving plant."}), 500


@user_routes.route("/get_saved_plants", methods=["GET"])
def get_saved_plants():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error": "User ID is required."}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found."}), 404

        return jsonify(user.get("savedPlants", [])), 200
    except Exception as e:
        print("Get saved plants error:", e)
        return jsonify({"error": "Server error while fetching saved plants."}), 500

@user_routes.route("/wishlist_add", methods=["POST"])
def wishlist_add():
    data = request.get_json()
    user_id = data.get("userId")
    product_id = data.get("productId")

    if not user_id or not product_id:
        return jsonify({"error": "User ID and product ID are required."}), 400

    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"wishlist": str(product_id)}}  # ✅ store as string
    )

    return jsonify({"message": "Product added to wishlist."}), 200

@user_routes.route("/wishlist_remove", methods=["POST"])
def wishlist_remove():
    data = request.get_json()
    user_id = data.get("userId")
    product_id = data.get("productId")
    if not user_id or not product_id:
        return jsonify({"error": "User ID and product ID are required."}), 400
    # Remove product from wishlist
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"wishlist": product_id}}
    )
    return jsonify({"message": "Product removed from wishlist."}), 200

@user_routes.route("/get_wishlist", methods=["GET"])
def get_wishlist():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "User ID is required."}), 400
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found."}), 404
    wishlist = user.get("wishlist", [])
    return jsonify(wishlist), 200


@user_routes.route("/get_wishlist_details", methods=["GET"])
def get_wishlist_details():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        wishlist_ids = user.get("wishlist", [])
        print(f"Wishlist IDs for user {user_id}: {wishlist_ids}")  # Debug

        if not wishlist_ids:
            return jsonify([]), 200

        # ✅ Direct string match because your product _id is like "plant003"
        collections = [
            plants_collection,
            seeds_collection,
            skincare_collection,
            accessories_collection,
            medicines_collection
        ]

        products = []
        for col in collections:
            found = list(col.find({"_id": {"$in": wishlist_ids}},
                                  {"_id": 1, "name": 1, "image": 1, "category": 1}))
            print(f"Found {len(found)} products in {col.name}")
            for p in found:
                p["_id"] = str(p["_id"])
                products.append(p)

        print(f"Returning {len(products)} wishlist products")
        return jsonify(products), 200

    except Exception as e:
        print(f"Error in get_wishlist_details: {e}")
        return jsonify({"error": "Server error"}), 500

# ----------------------------
# Save Plant Search History (No Duplicates, Just Update Time)
# ----------------------------
@user_routes.route("/record_search", methods=["POST"])
def record_search():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        plant = data.get("plant")

        if not user_id or not plant:
            return jsonify({"error": "User ID and plant data are required."}), 400

        # Find if plant already exists in searchHistory
        user = users_collection.find_one(
            {"_id": ObjectId(user_id), "searchHistory.plant": plant},
            {"searchHistory.$": 1}
        )

        if user and "searchHistory" in user:
            # ✅ Update timestamp for matching plant
            users_collection.update_one(
                {"_id": ObjectId(user_id), "searchHistory.plant": plant},
                {"$set": {"searchHistory.$.searched_at": datetime.now(timezone.utc)}}
            )
        else:
            # ✅ Push new entry if plant not found
            search_entry = {
                "plant": plant,
                "searched_at": datetime.now(timezone.utc)
            }
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"searchHistory": search_entry}}
            )

        return jsonify({"message": "Search history updated"}), 200

    except Exception as e:
        print("Error saving search history:", e)
        return jsonify({"error": "Server error while saving search history"}), 500


# ----------------------------
# Save Product Search History (No Duplicates, Just Update Time)
# ----------------------------
@user_routes.route("/record_product_search", methods=["POST"])
def record_product_search():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        product = data.get("product")

        if not user_id or not product:
            return jsonify({"error": "User ID and product data are required."}), 400

        # Find if product already exists in productSearchHistory
        user = users_collection.find_one(
            {"_id": ObjectId(user_id), "productSearchHistory.product": product},
            {"productSearchHistory.$": 1}
        )

        if user and "productSearchHistory" in user:
            # ✅ Update timestamp for matching product
            users_collection.update_one(
                {"_id": ObjectId(user_id), "productSearchHistory.product": product},
                {"$set": {"productSearchHistory.$.searched_at": datetime.now(timezone.utc)}}
            )
        else:
            # ✅ Push new entry if product not found
            search_entry = {
                "product": product,
                "searched_at": datetime.now(timezone.utc)
            }
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"productSearchHistory": search_entry}}
            )

        return jsonify({"message": "Product search history updated"}), 200

    except Exception as e:
        print("Error saving product search history:", e)
        return jsonify({"error": "Server error while saving product search history"}), 500

# ✅ Convert datetime to IST, handling naive datetimes as UTC
def datetime_to_ist_iso(dt):
    if not isinstance(dt, datetime):
        return None
    if dt.tzinfo is None:  # Naive datetime → assume UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST).isoformat()


# ----------------------------
# Fetch Plant Search History
# ----------------------------
@user_routes.route("/get_search_history", methods=["GET"])
def get_search_history():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        history = user.get("searchHistory", [])
        history.sort(key=lambda x: x.get("searched_at") or datetime.min, reverse=True)

        for entry in history:
            entry["searched_at"] = datetime_to_ist_iso(entry.get("searched_at"))

        return jsonify(history), 200

    except Exception as e:
        print("Error fetching search history:", e)
        return jsonify({"error": "Server error while fetching search history"}), 500


# ----------------------------
# Fetch Product Search History
# ----------------------------
@user_routes.route("/get_product_search_history", methods=["GET"])
def get_product_search_history():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        history = user.get("productSearchHistory", [])
        history.sort(key=lambda x: x.get("searched_at") or datetime.min, reverse=True)

        for entry in history:
            entry["searched_at"] = datetime_to_ist_iso(entry.get("searched_at"))

        return jsonify(history), 200

    except Exception as e:
        print("Error fetching product search history:", e)
        return jsonify({"error": "Server error while fetching product search history"}), 500


@user_routes.route("/get_user_profile", methods=["GET"])
def get_user_profile():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one(
            {"_id": ObjectId(user_id)},
            {
                "_id": 0,
                "fullName": 1,
                "username": 1,
                "email": 1,
                "phone": 1,
                "address": 1,
                "city": 1,
                "postalCode": 1,
                "profileImage": 1,
                "plantPreferences": 1
            }
        )
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user), 200
    except Exception as e:
        print("Error fetching user profile:", e)
        return jsonify({"error": "Server error while fetching user profile"}), 500
