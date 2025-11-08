import React from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ cart, userEmail, userId, closeModal, setCart, onClose }) => {
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const handleCheckout = () => {
        if (!userEmail || !userId) {
            console.error('User not logged in:', { userEmail, userId });
            alert('Please log in to checkout.');
            return;
        }
        const payload = { userId: userId, email: userEmail };
        console.log('Checkout payload:', payload);
        fetch('http://localhost:5000/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Failed to checkout'); });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error('Error from server:', data.error);
                    alert(`Error: ${data.error}`);
                    return;
                }
                setCart([]);
                closeModal();
                onClose();
                alert('Purchase completed successfully!');
            })
            .catch(error => {
                console.error('Error during checkout:', error.message);
                alert(`Error during checkout: ${error.message}`);
            });
    };

    return (
        <div className="checkout-modal-overlay" onClick={() => { closeModal(); onClose(); }}>
            <div className="checkout-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={() => { closeModal(); onClose(); }}>
                    ×
                </button>
                <div className="modal-content">
                    <h2>Checkout</h2>
                    <div className="checkout-items">
                        {cart.map(item => (
                            <div key={item._id} className="checkout-item">
                                <img src={item.image} alt={item.name} />
                                <div className="checkout-item-info">
                                    <h3>{item.name}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Price: ₹{item.price}</p>
                                    <p>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="checkout-summary">
                        <h3>Total: ₹{calculateTotal()}</h3>
                        <div className="modal-buttons">
                            <button className="cancel-button" onClick={() => { closeModal(); onClose(); }}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleCheckout} disabled={!userEmail || !userId}>
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;