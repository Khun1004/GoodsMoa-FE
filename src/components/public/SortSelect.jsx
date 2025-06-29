import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const SortSelect = ({ options = [], selected, onChange, className = '' }) => {
    const styles = {
        wrapper: {
            position: 'relative',
            display: 'inline-block',
            width: '160px',
            fontFamily: 'NotoSansKR-Regular',
        },
        select: {
            width: '100%',
            padding: '11px 30px 11px 12px',
            fontSize: '18px',
            border: '1px solid rgba(82, 82, 82, 0.37)',
            borderRadius: '10px',
            backgroundColor: '#fff',
            color: '#000',
            fontFamily: 'inherit',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            outline: 'none',
            boxShadow: 'none',
            cursor: 'pointer',
        },
        icon: {
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#666',
            fontSize: '17px',
        },
    };

    return (
        <div style={styles.wrapper} className={className}>
            <select
                style={styles.select}
                value={selected}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <FaChevronDown style={styles.icon} />
        </div>
    );
};

export default SortSelect;
