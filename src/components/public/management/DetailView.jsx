// DetailView.js
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import './ManagementComponents.css';

const DetailView = ({ onBack, headerActions, children }) => {
    return (
        <div className="detail-view-container">
            <div className="detail-view-header">
                <button onClick={onBack} className="detail-back-btn">
                    <ArrowLeft size={20} />
                    목록으로 돌아가기
                </button>
                <div className="detail-actions">
                    {headerActions}
                </div>
            </div>
            <div className="detail-view-content">
                {children}
            </div>
        </div>
    );
};

export default DetailView;