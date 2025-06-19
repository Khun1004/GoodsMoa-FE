import React from 'react';
import { IoMdSearch } from "react-icons/io";

const SearchBanner = ({
                          title = "판매 제품 검색",
                          searchQuery,
                          setSearchQuery,
                          handleSearchKeyPress
                      }) => {
    return (
        <div style={styles.banner}>
            <div style={styles.row}>
                <h1 style={styles.title}>{title}</h1>

                <div style={styles.inputWrapper}>
                    <IoMdSearch style={styles.icon}/>
                    <input
                        type="text"
                        placeholder="제목, 해시태그 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        style={styles.input}
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    banner: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.25)',
        textAlign: 'left', // 왼쪽 정렬
        borderRadius: '10px',
        marginBottom: '30px',
        padding: '0px',

    },
    content: {
        maxWidth: '800px',
        padding: '20px',

    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px', // 텍스트와 input 사이 간격
    },
    title: {
        fontSize: '22px',
        color: '#333',
        fontWeight: 370,
        fontFamily: 'Noto Sans KR, sans-serif',
        margin: 0, // 줄 간격 없애기
        whiteSpace: 'nowrap',
        marginLeft: '27px',
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        flexShrink: 0
    },
    icon: {
        position: 'absolute',
        top: '50%',
        left: '12px',
        transform: 'translateY(-50%)',
        fontSize: '22px',
        color: 'rgba(0,0,0,0.7)',
        zIndex: 2
    },
    input: {
        width: '100%',
        padding: '10px 18px 10px 42px', // 아이콘 공간
        fontSize: '16px',
    /*    border: '2px solid #000000',*/
        borderRadius: '8px',
        borderColor: 'rgba(0,0,0,0.17)',
        fontFamily: 'Noto Sans KR, sans-serif',
        outline: 'none',
        transition: 'all 0.3s ease',
        backgroundColor:'rgba(82,82,82,0.07)',
    },
};

export default SearchBanner;
