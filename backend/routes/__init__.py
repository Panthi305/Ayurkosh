from .user import user_routes
from .chatbot import chatbot_bp
from .plant import plant_bp
from .suggestions import suggestion_bp
from .map import map_bp
from .products import products_bp
from .cart import cart_bp
from .shopping import shopping_bp
from .coupon_routes import coupon_bp
from .plant_model import search_bp
from .orders import orders_bp
from .contact import contact_bp

def register_routes(app):
    app.register_blueprint(user_routes)
    app.register_blueprint(chatbot_bp, url_prefix="/")
    app.register_blueprint(plant_bp, url_prefix="/")
    app.register_blueprint(suggestion_bp, url_prefix="/api")
    app.register_blueprint(map_bp, url_prefix="/api")
    app.register_blueprint(products_bp, url_prefix='/api')
    app.register_blueprint(cart_bp, url_prefix='/api')
    app.register_blueprint(shopping_bp, url_prefix='/')
    app.register_blueprint(coupon_bp, url_prefix='/api/coupons')
    app.register_blueprint(search_bp)
    app.register_blueprint(orders_bp, url_prefix='/api')
    app.register_blueprint(contact_bp, url_prefix="/api/contact")
