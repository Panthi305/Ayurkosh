from flask import Blueprint, request, jsonify
from datetime import datetime
from db import coupons_collection

coupon_bp = Blueprint('coupon_bp', __name__, url_prefix='/coupons')  # Add /coupons prefix to match frontend URL

@coupon_bp.route('/test', methods=['GET'])
def test_coupon_route():
    return jsonify({'message': 'Coupon routes are working'}), 200

@coupon_bp.route('/suggestions', methods=['GET'])
def get_coupon_suggestions():
    try:
        user_email = request.args.get('userEmail')
        order_total = float(request.args.get('orderTotal', 0))
        
        if not user_email:
            return jsonify({'error': 'userEmail is required'}), 400

        now = datetime.utcnow()
        now_str = now.isoformat() + 'Z'  # Convert to ISO string for comparison with string dates in DB

        query = {
            'expirationDate': {'$gt': now_str},
            'minOrderAmount': {'$lte': order_total},
            '$expr': {'$lt': ['$uses', '$maxUses']}
        }
        # Removed $or condition to make all coupons available regardless of applicableUsers
        
        coupons = list(coupons_collection.find(query).limit(5))
        for coupon in coupons:
            coupon['_id'] = str(coupon['_id'])
        
        return jsonify(coupons), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch suggestions: {str(e)}'}), 500

@coupon_bp.route('/apply', methods=['POST'])
def apply_coupon():
    try:
        data = request.get_json()
        code = data.get('code', '').upper()
        user_id = data.get('userId')
        user_email = data.get('userEmail')
        order_total = float(data.get('orderTotal', 0))

        if not code or not user_id or not user_email:
            return jsonify({'error': 'Missing required fields'}), 400

        coupon = coupons_collection.find_one({'code': code})
        if not coupon:
            return jsonify({'error': 'Invalid coupon code'}), 400

        now = datetime.utcnow()
        now_str = now.isoformat() + 'Z'
        if coupon['expirationDate'] < now_str:  # String comparison
            return jsonify({'error': 'Coupon expired'}), 400
        if coupon['uses'] >= coupon['maxUses']:
            return jsonify({'error': 'Coupon usage limit reached'}), 400
        if order_total < coupon['minOrderAmount']:
            return jsonify({'error': f'Minimum order amount is ₹{coupon["minOrderAmount"]}'}), 400
        # Removed applicableUsers check to allow all coupons for any user

        discount = 0
        if coupon['discountType'] == 'percentage':
            discount = (coupon['discountValue'] / 100) * order_total
        else:
            discount = coupon['discountValue']

        coupons_collection.update_one(
            {'code': coupon['code']},
            {'$inc': {'uses': 1}}
        )

        coupon['_id'] = str(coupon['_id'])
        return jsonify({
            'success': True,
            'discount': discount,
            'message': 'Coupon applied successfully',
            'coupon': coupon
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to apply coupon: {str(e)}'}), 500