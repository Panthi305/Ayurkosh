// MessageModal.jsx
import React, { useEffect } from 'react';
import './MessageModal.css';

const MessageModal = ({ isOpen, onClose, onProceed }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="msg-modal-overlay" onClick={onClose}>
      <div className="msg-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="msg-modal-close" onClick={onClose}>
          &times;
        </button>
        
        <div className="msg-modal-body">
          <div className="msg-modal-icon-container">
            <svg className="msg-modal-lock-icon" viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
            </svg>
          </div>
          
          <h2 className="msg-modal-title">Login Required</h2>
          <p className="msg-modal-text">You have to login first to view your cart.</p>
          
          <div className="msg-modal-buttons">
            <button className="msg-modal-cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="msg-modal-proceed-button" onClick={onProceed}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;