from flask import Blueprint, jsonify, request
from db import plants_collection, seeds_collection, skincare_collection, accessories_collection, medicines_collection
from bson import ObjectId

products_bp = Blueprint('products', __name__)

def serialize_product(product):
    """Helper function to convert ObjectId to string."""
    product['_id'] = str(product['_id'])
    return product

@products_bp.route('/products', methods=['GET'])
def get_products():
    """Fetches all products from all collections."""
    try:
        projection = {
            '_id': 1,
            'name': 1,
            'description': 1,
            'price': 1,
            'category': 1,
            'image': 1,
            'stock': 1,
            'filters': 1,
            'careLevel': 1,
            'lightRequirements': 1,
            'wateringNeeds': 1,
            'germinationTime': 1,
            'bestSeason': 1,
            'ingredients': 1,
            'benefits': 1,
            'material': 1,
            'size': 1,
            'dosage': 1,
            'rating': 1
        }
        
        products = (
            list(plants_collection.find({}, projection)) +
            list(seeds_collection.find({}, projection)) +
            list(skincare_collection.find({}, projection)) +
            list(accessories_collection.find({}, projection)) +
            list(medicines_collection.find({}, projection))
        )
        
        products_serialized = [serialize_product(p) for p in products]
        
        return jsonify(products_serialized), 200
    except Exception as e:
        print(f"Error in get_products: {e}")
        return jsonify({"error": str(e)}), 500

@products_bp.route('/products/search', methods=['GET'])
def search_products():
    """Searches for products based on a query string."""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify([]), 200

        # Case-insensitive regex for partial match (anywhere in the name)
        search_regex = {"$regex": query, "$options": "i"}

        projection = {'_id': 1, 'name': 1, 'category': 1, 'image': 1}

        combined_results = (
            list(plants_collection.find({'name': search_regex}, projection)) +
            list(seeds_collection.find({'name': search_regex}, projection)) +
            list(skincare_collection.find({'name': search_regex}, projection)) +
            list(accessories_collection.find({'name': search_regex}, projection)) +
            list(medicines_collection.find({'name': search_regex}, projection))
        )
        
        results = [serialize_product(p) for p in combined_results]
        
        return jsonify(results[:10]), 200

    except Exception as e:
        print(f"Error in search_products: {e}")
        return jsonify({"error": str(e)}), 500