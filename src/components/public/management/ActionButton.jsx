import React from 'react';
import './ActionButton.css'; // 아래 CSS 추가

const ActionButton = ({ onClick, children, variant = 'default', ...props }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <button className={`action-button variant-${variant}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

export default ActionButton;