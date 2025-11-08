import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./PaymentInfo.css";

const upiQrValue = "upi://pay?pa=your-upi-id@bank&pn=Ayurkosh%20Payment";

const PaymentInfo = ({ onBack, onContinue }) => {
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [showQrModal, setShowQrModal] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        bankName: "",
        upiId: "",
        walletType: "",
        walletMobile: "",
    });
    const [isPaid, setIsPaid] = useState(false);

    const paymentOptions = [
        { value: "card", label: "Credit/Debit Card" },
        { value: "upi", label: "UPI / QR Pay" },
        { value: "netbanking", label: "Net Banking" },
        { value: "cod", label: "Cash on Delivery" },
        { value: "wallet", label: "Wallet" },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContinue = (e) => {
        e.preventDefault();
        if (paymentMethod === "upi") {
            setShowQrModal(true);
        } else {
            setIsPaid(true);
        }
    };

    const handleQrSuccess = () => {
        setShowQrModal(false);
        setIsPaid(true);
    };

    // ✅ When payment is done, move to Review Order step
    const handleConfirm = async () => {
        const storedUserId = localStorage.getItem("userId") || "";
        const email = localStorage.getItem("userEmail") || "";
        if (!storedUserId || !email) {
            alert("User credentials missing");
            return;
        }

        const paymentData = {
            userId: storedUserId,
            email,
            paymentMethod,
            ...formData,
            isPaid: true,
        };

        try {
            const res = await fetch("http://localhost:5000/shopping-info/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData),
            });
            const data = await res.json();
            if (!data.error) {
                // ✅ Move to review step in Orders.jsx
                onContinue(paymentData);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Failed to save payment info.");
        }
    };

    return (
        <div className="payment-container">
            <h2 className="payment-title">Payment Information</h2>
            <form className="payment-form" onSubmit={handleContinue}>
                <div className="payment-methods">
                    {paymentOptions.map((opt) => (
                        <label
                            key={opt.value}
                            className={`payment-option ${paymentMethod === opt.value ? "selected" : ""}`}
                            onClick={() => setPaymentMethod(opt.value)}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={opt.value}
                                checked={paymentMethod === opt.value}
                                onChange={() => setPaymentMethod(opt.value)}
                            />
                            {opt.label}
                            {opt.value === "card" && (
                                <>
                                    <span className="badge">VISA</span>
                                    <span className="badge">MC</span>
                                    <span className="badge">RuPay</span>
                                </>
                            )}
                            {opt.value === "upi" && <span className="badge upi">UPI / QR</span>}
                            {opt.value === "wallet" && <span className="badge wallet">Paytm / PhonePe</span>}
                        </label>
                    ))}
                </div>

                {paymentMethod === "card" && (
                    <div className="card-fields">
                        <label>Card Number *</label>
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            required
                        />
                        <div className="payment-row">
                            <div>
                                <label>Expiry Date *</label>
                                <input
                                    type="text"
                                    name="expiryDate"
                                    placeholder="MM/YY"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>CVV *</label>
                                <input
                                    type="password"
                                    name="cvv"
                                    placeholder="123"
                                    value={formData.cvv}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="secure-note">
                            🔒 Your payment information is encrypted and secure
                        </div>
                        <button className="paynow-btn" type="submit">Pay Now</button>
                    </div>
                )}

                {paymentMethod === "upi" && (
                    <div className="upi-fields">
                        <label>Enter your UPI ID *</label>
                        <input
                            type="text"
                            name="upiId"
                            placeholder="yourupi@bank"
                            value={formData.upiId}
                            onChange={handleChange}
                            required
                        />
                        <button className="paynow-btn" type="button" onClick={handleContinue}>
                            Pay Using QR Code
                        </button>
                    </div>
                )}

                {showQrModal && (
                    <div className="qr-modal-overlay">
                        <div className="qr-modal-content">
                            <h3>Scan to Pay (UPI/QR)</h3>
                            <QRCodeCanvas value={upiQrValue} size={180} />
                            <p>Scan with any UPI app.</p>
                            <button className="paynow-btn" onClick={handleQrSuccess}>
                                I've Paid!
                            </button>
                            <button className="close-btn" onClick={() => setShowQrModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {paymentMethod === "netbanking" && (
                    <div className="netbanking-fields">
                        <label>Select Bank *</label>
                        <select
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Choose Bank</option>
                            <option value="SBI">SBI</option>
                            <option value="ICICI">ICICI</option>
                            <option value="HDFC">HDFC</option>
                            <option value="Axis">Axis</option>
                            <option value="Kotak">Kotak</option>
                        </select>
                        <button className="paynow-btn" type="submit">Pay Now</button>
                    </div>
                )}

                {paymentMethod === "cod" && (
                    <div className="cod-fields">
                        <div className="cod-note">Pay cash upon delivery. No online payment required.</div>
                        <button className="paynow-btn" type="button" onClick={() => setIsPaid(true)}>
                            Confirm Cash on Delivery
                        </button>
                    </div>
                )}

                {paymentMethod === "wallet" && (
                    <div className="wallet-fields">
                        <label>Select Wallet *</label>
                        <select
                            name="walletType"
                            value={formData.walletType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Choose Wallet</option>
                            <option value="Paytm">Paytm</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="GooglePay">Google Pay</option>
                        </select>
                        <label>Mobile Number *</label>
                        <input
                            type="text"
                            name="walletMobile"
                            placeholder="Enter Mobile Number"
                            value={formData.walletMobile}
                            onChange={handleChange}
                            required
                        />
                        <button className="paynow-btn" type="submit">Pay Now</button>
                    </div>
                )}

                {isPaid && (
                    <div className="success-modal-overlay">
                        <div className="success-modal-content">
                            <h3>Payment Successful!</h3>
                            <p>Your payment has been received.</p>
                            <button className="confirm-btn" onClick={handleConfirm}>
                                Review Order
                            </button>
                        </div>
                    </div>
                )}

                <div className="payment-buttons">
                    <button type="button" className="back-btn" onClick={onBack}>
                        Back to Shipping
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentInfo;
