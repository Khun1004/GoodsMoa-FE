// SectionCard.js
import React from 'react';
import './ManagementComponents.css';

const SectionCard = ({ title, icon, children }) => {
    return (
        <div className="section-card">
            <h2 className="section-title">
                {icon}
                {title}
            </h2>
            <div className="section-content">
                {children}
            </div>
        </div>
    );
};

export default SectionCard;