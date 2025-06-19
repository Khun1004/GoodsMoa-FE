import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

const SeeMoreButton = ({ onClick, children = '더 보기' }) => {
    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle = {
        border:'solid #000000',
        borderWidth: '0.1px',
        borderColor: 'rgba(142,142,142,0.37)',
/*        backgroundColor: 'rgba(0,0,0,0.07)',*/
        marginBottom: '17px',
        padding: '0.77rem 1.2rem',
        fontSize: '1.1rem',
        fontFamily: 'Noto Sans KR, sans-serif',
        color: 'rgba(0,0,0,0.57)',
        borderRadius: '100px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginRight: '7px',
    };

    const hoverStyle = {
        backgroundColor: '#fafafa',
    };

    return (
        <button
            style={isHovered ? { ...buttonStyle, ...hoverStyle } : buttonStyle}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <FiPlus />
            {children}
        </button>
    );
};

export default SeeMoreButton;
