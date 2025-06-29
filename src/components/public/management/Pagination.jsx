import React from "react";

const Pagination = ({ page, totalPages, onPageChange, groupSize = 6 }) => {
    if (totalPages <= 1) return null;

    const startPage = Math.floor(page / groupSize) * groupSize;
    const endPage = Math.min(startPage + groupSize, totalPages);

    const pageNumbers = [];
    for (let i = startPage; i < endPage; i++) {
        pageNumbers.push(i);
    }

    const baseButtonStyle = {
        padding: "6px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "white",
        color: "#374151",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
    };

    const activeButtonStyle = {
        ...baseButtonStyle,
        backgroundColor: "#3b82f6",
        color: "white",
        borderColor: "#3b82f6",
    };

    const disabledStyle = {
        ...baseButtonStyle,
        opacity: 0.4,
        cursor: "not-allowed",
    };

    const ellipsisStyle = {
        ...baseButtonStyle,
        backgroundColor: "transparent",
        border: "none",
        fontWeight: "bold",
        color: "#6b7280",
        cursor: "pointer"
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "2rem" }}>
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                style={page === 0 ? disabledStyle : baseButtonStyle}
            >
                &lt;
            </button>

            {startPage > 0 && (
                <button onClick={() => onPageChange(startPage - 1)} style={ellipsisStyle}>...</button>
            )}

            {pageNumbers.map((idx) => (
                <button
                    key={idx}
                    style={idx === page ? activeButtonStyle : baseButtonStyle}
                    onClick={() => onPageChange(idx)}
                >
                    {idx + 1}
                </button>
            ))}

            {endPage < totalPages && (
                <button onClick={() => onPageChange(endPage)} style={ellipsisStyle}>...</button>
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages - 1}
                style={page === totalPages - 1 ? disabledStyle : baseButtonStyle}
            >
                &gt;
            </button>
        </div>
    );
};

export default Pagination;
