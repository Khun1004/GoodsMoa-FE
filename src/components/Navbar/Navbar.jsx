import React, { useContext, useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaChartBar, FaExchangeAlt, FaGift, FaHome, FaPaintBrush, FaPen, FaPlus, FaPoll, FaSignInAlt, FaSignOutAlt, FaStore, FaUserPlus, FaUsers } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import { MdMonochromePhotos } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/GoodsmoaLogo.png";
import NavbarHeaderVideo from '../../assets/navbar1.mp4';
import { LoginContext } from "../../contexts/LoginContext";
import { RxCross2 } from 'react-icons/rx';
import DarkMode from "./DarkMode";
import './Navbar.css';

const STORAGE_KEY = "wantedProducts";

const Menu = [
    { id: 1, name: "홈", link: "/", icon: <FaHome /> },
    { id: 2, name: "판매", link: "/sale", icon: <FaStore /> },
    { id: 3, name: "커미션", link: "/commission", icon: <FaPaintBrush /> },
    { id: 4, name: "중고거래", link: "/trade", icon: <FaExchangeAlt /> },
    { id: 5, name: "수요조사", link: "/demand", icon: <FaChartBar /> },
    { id: 6, name: "커뮤니티", link: "/community", icon: <FaUsers /> },
];
const getRecentSearches = () => {
    try {
        const searches = localStorage.getItem('recentSearches');
        return searches ? JSON.parse(searches) : [];
    } catch (error) {
        console.error("최근 검색어 로딩 실패:", error);
        return [];
    }
};

// localStorage에 최근 검색어를 저장하는 헬퍼 함수
const saveRecentSearches = (searches) => {
    try {
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    } catch (error) {
        console.error("최근 검색어 저장 실패:", error);
    }
};

const Navbar = () => {
    const { isLogin, userInfo, logout } = useContext(LoginContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [recentSearches, setRecentSearches] = useState(getRecentSearches());
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchContainerRef = useRef(null);
    const image = localStorage.getItem("profileImage");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState(null);
    const [buttonText, setButtonText] = useState("+품만들기");
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const placeholders = ["1 판매", "2 커미션", "3 중고거래", "4 수요조사", "5 커뮤니티"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✨ 4. 검색과 관련된 모든 핸들러 함수들을 추가합니다.
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const newSearchTerm = searchTerm.trim();
        if (!newSearchTerm) return;

        const updatedSearches = [newSearchTerm, ...recentSearches.filter(s => s !== newSearchTerm)].slice(0, 10);
        setRecentSearches(updatedSearches);
        saveRecentSearches(updatedSearches);

        setIsSearchFocused(false);
        // 네가 만든 새로운 검색 결과 페이지로 이동하도록 경로를 수정했어!
        // 쿼리 파라미터도 'q'로 정확하게 맞춰줬어.
        navigate(`/search/results?q=${encodeURIComponent(newSearchTerm)}`);
    };

    const handleDeleteSearch = (e, searchToDelete) => {
        e.stopPropagation();
        const updatedSearches = recentSearches.filter(s => s !== searchToDelete);
        setRecentSearches(updatedSearches);
        saveRecentSearches(updatedSearches);
    };

    const handleClearAll = (e) => {
        e.stopPropagation();
        setRecentSearches([]);
        saveRecentSearches([]);
    }

    useEffect(() => {
        const updateCartCount = () => {
            const storedProducts = localStorage.getItem(STORAGE_KEY);
            const products = storedProducts ? JSON.parse(storedProducts) : [];
            setCartCount(products.length);
        };

        updateCartCount();

        const handleStorageChange = () => {
            updateCartCount();
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const storedProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        setCartCount(storedProducts.length);

        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleMenuItemClick = (link, name) => {
        setActiveMenuItem(link);
        setButtonText(
            name === "판매" ? "판매 폼 만들기" :
                name === "커미션" ? "커미션 폼 만들기" :
                    name === "중고거래" ? "중고 거래 폼 만들기" :
                        name === "수요조사" ? "수요조사하기 폼 만들기" :
                            name === "커뮤니티" ? "커뮤니티 폼 만들기" :
                                "+폼만들기"
        );
        setIsMobileMenuOpen(false);
    };


    const toggleFormMenu = (e) => {
        e.stopPropagation();
        setIsFormMenuOpen((prev) => !prev);
    };

    const toggleMobileMenu = (e) => {
        e.stopPropagation();
        setIsMobileMenuOpen((prev) => !prev);
    };

    const handleFormLinkClick = (e) => {
        if (!isLogin) {
            e.preventDefault();
            setIsFormMenuOpen(false);
            navigate("/Login");
        }
    };

    const handleOrderPage = () => navigate("/order");

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    useEffect(() => {
        const currentPath = window.location.pathname;
        const active = Menu.find((item) => item.link === currentPath);
        if (active) handleMenuItemClick(active.link, active.name);
    }, [window.location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFormMenuOpen && !event.target.closest(".form-menu-container")) {
                setIsFormMenuOpen(false);
            }
            if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isFormMenuOpen, isMobileMenuOpen]);

    return (
        <div className="navbar">
            {/* Upper Navbar */}
            <div className="navbar__upper dark:bg-gray-950 dark:text-white duration-200 relative z-40">
                <video autoPlay loop muted className="headerVideo" src={NavbarHeaderVideo}></video>
                <div className="container flex justify-between items-center">
                    <Link to="/" className="navbar__logo">
                        <img src={Logo} alt="Logo" className="navbar__logo-img" />
                        <span className="navbar__bouncing-text">

                        </span>
                    </Link>

                    <div className="navbar__controls flex items-center gap-4">

                        {/* 네이버 스타일 검색창 */}
                        <div ref={searchContainerRef} className="relative group hidden sm:block">
                            <form onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    placeholder="검색어를 입력하세요"
                                    className="navbar__search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                />
                            </form>
                            <IoMdSearch className="navbar__search-icon" onClick={handleSearchSubmit} />

                            {/* 최근 검색어 드롭다운 (z-50으로 가장 높게 설정) */}
                            {isSearchFocused && (
                                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 mt-1">
                                    {recentSearches.length > 0 ? (
                                        <ul>
                                            <li className="flex justify-between items-center p-2 text-xs text-gray-500">
                                                <span>최근 검색어</span>
                                                <button onClick={handleClearAll} className="hover:text-red-500">전체 삭제</button>
                                            </li>
                                            {recentSearches.map((search, index) => (
                                                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                    onClick={() => {
                                                        setSearchTerm(search);
                                                        navigate(`/search/results?q=${encodeURIComponent(search)}`);
                                                        setIsSearchFocused(false);
                                                    }}>
                                                    <span>{search}</span>
                                                    <button onClick={(e) => handleDeleteSearch(e, search)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                                        <RxCross2 />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">최근 검색 기록이 없습니다.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button className="navbar__order-btn" onClick={handleOrderPage}>
                            <span className="navbar__order-text">Order</span>
                            <div className="cart-icon-container">
                                <FaCartShopping className="navbar__cart-icon" />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </div>
                        </button>

                        <div className="relative form-menu-container">
                            <button className="navbar__action-btn" onClick={toggleFormMenu}>
                                <span className="btn-text">{buttonText}</span>
                                <FaPlus className="btn-icon" />
                            </button>
                            {isFormMenuOpen && (
                                <div className="form-menu open">
                                    <ul>
                                        <li><Link to="/saleForm" onClick={handleFormLinkClick}><FaPen className="inline-block mr-2 text-blue-500" />판매 폼 만들기</Link></li>
                                        <li><Link to="/commissionForm" onClick={handleFormLinkClick}><FaPaintBrush className="inline-block mr-2 text-purple-500" />커미션 폼 만들기</Link></li>
                                        <li><Link to="/tradeForm" onClick={handleFormLinkClick}><FaGift className="inline-block mr-2 text-red-500" />중고거래 폼 만들기</Link></li>
                                        <li><Link to="/demandForm" onClick={handleFormLinkClick}><FaPoll className="inline-block mr-2 text-green-500" />수요조사하기 폼 만들기</Link></li>
                                        <li><Link to="/communityForm" onClick={handleFormLinkClick}><FaCalendarAlt className="inline-block mr-2 text-yellow-500" />커뮤니티 폼 만들기</Link></li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {!isLogin ? (
                            <>
                                <button className="navbar__action-btn" onClick={() => navigate("/login")}>
                                    <span className="btn-text">로그인</span>
                                    <FaSignInAlt className="btn-icon" />
                                </button>
                                <button className="navbar__action-btn" onClick={() => navigate("/auth?mode=signup")}>
                                    <span className="btn-text">회원가입</span>
                                    <FaUserPlus className="btn-icon" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="navbar__profile flex items-center gap-2 cursor-pointer" onClick={() => navigate("/mypage")}>
                                    {image ? (
                                        <img
                                            src={image}
                                            alt="Profile"
                                            className="navbar__profile-image rounded-full w-7 h-6 border border-black"
                                        />
                                    ) : (
                                        <div className="rounded-full w-7 h-6 flex items-center justify-center border border-white">
                                            <MdMonochromePhotos className="text-white w-4 h-6" />
                                        </div>
                                    )}
                                    <span className="profile-text">{userInfo?.nickname ? `${userInfo.nickname} 님` : "회원님"}</span>
                                </div>
                                <button className="navbar__action-btn" onClick={handleLogout}>
                                    <span className="btn-text">로그아웃</span>
                                    <FaSignOutAlt className="btn-icon" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Lower Navbar */}
            {/* ✨ 하단 바에는 상단 바보다 낮은 z-10을 줘서 순서를 명확히 합니다. */}
            <div className="navbar__lower relative z-10">
                {/* 데스크탑 메뉴 */}
                <ul className="navbar__menu desktop-menu">
                    {Menu.map((data) => (
                        <li key={data.id}>
                            <Link
                                to={data.link}
                                className={`navbar__menu-item ${activeMenuItem === data.link ? "active" : ""}`}
                                onClick={() => handleMenuItemClick(data.link, data.name)}
                            >
                                <span className="menu-icon">{data.icon}</span>
                                <span className="menu-text">{data.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* 모바일 메뉴 토글 버튼 */}
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                        <span></span><span></span><span></span>
                    </div>
                </button>

                {/* 모바일 메뉴 */}
                <div className={`mobile-menu-container ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu">
                        {Menu.map((data) => (
                            <li key={data.id}>
                                <Link
                                    to={data.link}
                                    className={`mobile-menu-item ${activeMenuItem === data.link ? "active" : ""}`}
                                    onClick={() => handleMenuItemClick(data.link, data.name)}
                                >
                                    <span className="menu-icon">{data.icon}</span>
                                    <span className="menu-text">{data.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
