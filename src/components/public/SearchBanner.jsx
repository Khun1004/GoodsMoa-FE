import React from 'react';
import { IoMdSearch } from "react-icons/io";

const SearchBanner = ({
                          placeholder = "검색어를 입력하세요",
                          searchQuery,
                          setSearchQuery,
                          handleSearchKeyPress,
                          selectedOption,
                          setSelectedOption,
                          selectOptions = ["전체","제목", "해시태그", "내용"] // 🔹 기본값 설정
                      }) => {
    return (
        <div style={styles.banner}>
            <div style={styles.searchBox}>
                {/* 🔽 드롭다운 */}
                <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    style={styles.select}
                >
                    {selectOptions.map((option, index) => (
                        <option key={index} value={option.toLowerCase()}>
                            {option}
                        </option>
                    ))}


                </select>

                {/* 🔍 검색 인풋 */}
                <div style={styles.inputWrapper}>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        style={styles.input}
                    />
                </div>

                {/* 🔘 돋보기 버튼 */}
                <button style={styles.searchButton} onClick={() => handleSearchKeyPress({ key: 'Enter' })}>
                    <IoMdSearch />
                </button>
            </div>
        </div>
    );
};

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
