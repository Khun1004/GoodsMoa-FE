import React from 'react';
import { IoMdSearch } from 'react-icons/io';

const SearchBanner = ({
                          // title = '검색:',
                          placeholder = '검색어 입력',
                          searchQuery,
                          setSearchQuery,
                          handleSearchKeyPress,
                          handleSearchSubmit,
                          searchType,
                          setSearchType
                      }) => {
    return (
        <div className="search-banner">
            {/*{title && <span className="search-banner-title">{title}</span>}*/}

            <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}  // 이 부분 꼭 있어야 함
                className="search-banner-select"
            >
                <option value="ALL">전체</option>
                <option value="TITLE">제목</option>
                <option value="DESCRIPTION">내용</option>
                <option value="HASHTAG">해시태그</option>
            </select>

            <div className="search-banner-input-wrapper">
                <input
                    type="text"
                    className="search-banner-input"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                />
            </div>

            <button
                className="search-banner-button"
                onClick={handleSearchSubmit}
            >
                <IoMdSearch />
            </button>
        </div>
    );
};

// export default SearchBanner;


const styles = {
    banner: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.25)',
        textAlign: 'left',
        borderRadius: '10px',
        marginBottom: '20px',
        padding: '0px',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        width: '100%',
        maxWidth: '1400px',
        padding: '0px 0px',
    },
    select: {
        padding: '10px 7px',
        fontSize: '15px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.3)',
        backgroundColor: '#fff',
        fontFamily: 'Noto Sans KR, sans-serif',
    },
    inputWrapper: {
        position: 'relative',
        flex: 1,
    },
    icon: {
        position: 'absolute',
        top: '50%',
        left: '12px',
        transform: 'translateY(-50%)',
        fontSize: '20px',
        color: 'rgba(0,0,0,0.6)',
        zIndex: 2,
    },
    input: {
        width: '100%',
        padding: '10px 4px 10px 17px',
        fontSize: '15px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.2)',
        fontFamily: 'Noto Sans KR, sans-serif',
        backgroundColor: 'rgba(82,82,82,0.07)',
        outline: 'none',
    },
    searchButton: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.2)',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default SearchBanner;
