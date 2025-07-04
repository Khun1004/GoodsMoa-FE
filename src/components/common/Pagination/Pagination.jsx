import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination">
            {Array.from({length: totalPages}, (_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`pagination-button ${i === currentPage ? 'active' : ''}`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default Pagination; 