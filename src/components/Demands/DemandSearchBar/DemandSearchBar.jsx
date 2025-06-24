// DemandSearchBar.jsx
import React from 'react';

const DemandSearchBar = ({
                             category,
                             setCategory,
                             searchTerm,
                             setSearchTerm,
                             orderBy,
                             setOrderBy,
                             includeExpired,
                             setIncludeExpired,
                             includeScheduled,
                             setIncludeScheduled,
                             categoryOptions
                         }) => {
    const handleCategoryChange = (selectedCategory) => setCategory(selectedCategory);

    return (
        <div className="search-bar-and-filters"
             style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {categoryOptions.map((option) => (
                    <button
                        key={option.id}
                        className={`category-button ${category === option.id ? 'selected' : ''}`}
                        onClick={() => handleCategoryChange(option.id)}
                    >
                        {option.name}
                    </button>
                ))}
            </div>
            <input
                type="text"
                placeholder="원하는 상품 검색하기"
                className="demand-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '14px' }}
            />
            <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                <option value="new">최신순</option>
                <option value="old">오래된순</option>
                <option value="close">마감임박</option>
            </select>
            <select value={includeExpired} onChange={(e) => setIncludeExpired(e.target.value === 'true')}>
                <option value="true">만료 포함</option>
                <option value="false">만료 제외</option>
            </select>
            <select value={includeScheduled} onChange={(e) => setIncludeScheduled(e.target.value === 'true')}>
                <option value="true">미시작 포함</option>
                <option value="false">미시작 제외</option>
            </select>
        </div>
    );
};

export default DemandSearchBar;
