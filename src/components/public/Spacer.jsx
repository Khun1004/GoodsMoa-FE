// src/components/public/Spacer.jsx
import React from 'react';

const Spacer = ({ height = 16 }) => {
    return (
        <div style={{ height: typeof height === 'number' ? `${height}px` : height }} />
    );
};

export default Spacer;
