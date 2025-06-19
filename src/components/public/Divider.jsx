import React from 'react';

const Divider = () => {
    const style = {
        margin: '2rem auto 0 auto',
        border: 'none',
        borderTop: '2px solid #e5e7eb',
        width: '1420px',
        boxSizing: 'border-box',
    };

    return <hr style={style} />;
};

export default Divider;
