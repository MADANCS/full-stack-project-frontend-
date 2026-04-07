import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay" 
                        onClick={onCancel} 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="modal-container"
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">{title}</h3>
                            <button className="modal-close" onClick={onCancel}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className={`modal-icon modal-icon-${type}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <p className="modal-message">{message}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                            <button 
                                className={`btn btn-${type === 'danger' ? 'primary' : 'secondary'}`} 
                                onClick={onConfirm}
                                style={type === 'danger' ? { background: 'var(--danger)', boxShadow: '0 0 15px rgba(225, 112, 85, 0.4)' } : {}}
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
