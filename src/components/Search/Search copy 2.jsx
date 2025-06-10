import React, { useState } from "react";
import { GoHome } from "react-icons/go";
import { IoMdSearch } from "react-icons/io";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import CommImage1 from '../../assets/commission/comm.png';
import CommImage2 from '../../assets/commission/comm2.png';
import CommImage3 from '../../assets/commission/comm3.png';
import CommImage4 from '../../assets/commission/comm4.png';
import './Search.css';

const mainCategories = [
    { id: 1, name: "창작캐릭터", icon: "🐱", route: "/category/1" },
    { id: 2, name: "창작공예/문구", icon: "😊", route: "/category/2" },
    { id: 3, name: "인형/인형소품", icon: "🧸", route: "/category/3" },
    { id: 4, name: "순수창작", icon: "💡", route: "/category/4" },
    { id: 5, name: "패션/액세서리", icon: "👕", route: "/category/5" },
    { id: 6, name: "아이돌/스타", icon: "💖", route: "/category/6" },
    { id: 7, name: "만화/애니", icon: "👓", route: "/category/7" },
    { id: 8, name: "밀키트/식사", icon: "🍇", route: "/category/8" },
    { id: 9, name: "게임", icon: "🎮", route: "/category/9" },
    { id: 10, name: "영화", icon: "🎞️", route: "/category/10" },
    { id: 11, name: "드라마", icon: "📺", route: "/category/11" },
    { id: 12, name: "공연/행사", icon: "🎟️", route: "/category/12" },
];

const commissionCategories = [
    { id: 1, name: "그림", icon: "🎨", route: "/paint" },
    { id: 2, name: "글", icon: "✍️" },
    { id: 3, name: "기타", icon: "✨" },
];

const popularProducts = [
    { id: 1, title: "상품 1", image: CommImage1, description: "설명 1" },
    { id: 2, title: "상품 2", image: CommImage2, description: "설명 2" },
    { id: 3, title: "상품 3", image: CommImage3, description: "설명 3" },
    { id: 4, title: "상품 4", image: CommImage4, description: "설명 4" },
];

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [noResultsFound, setNoResultsFound] = useState(false);
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const categoryRoutes = {
        "그림": "/paint",
        "글": "/writing",
        "기타": "/other",
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchQuery.trim()) {
                const route = categoryRoutes[searchQuery];
                if (route) {
                    navigate(`${route}?q=${searchQuery}`);
                    setNoResultsFound(false);
                } else {
                    const productFound = popularProducts.some(product =>
                        product.title.includes(searchQuery) || product.description.includes(searchQuery)
                    );
                    if (productFound) {
                        navigate(`/search?q=${searchQuery}`);
                        setNoResultsFound(false);
                    } else {
                        setNoResultsFound(true);
                    }
                }
            }
        }
    };

    const goHome = () => {
        navigate("/");
    };

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="container">
            <div className="Search">
                <ul className="search-controls">
                    <li className="back-button" onClick={goBack}>
                        <MdArrowBackIosNew size={20} />
                    </li>
                    <li className="home-button" onClick={goHome}>
                        <GoHome size={20} />
                    </li>
                    <li className="search-input-container">
                        <IoMdSearch className="search-icon" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="굿즈를 검색해 보세요/"
                        />
                    </li>
                </ul>
                <hr className="divider" />
            </div>

            {/* Display "No results found" message if no results */}
            {noResultsFound && (
                <div className="no-results-message">
                    죄송합니다. 검색한 결과가 없습니다. <br />
                    다시 검색해 보십시오😊😊😊
                </div>
            )}

            {/* Top products section */}
            <div className="topProducts">
                <div className="commission-cards">
                    <h1 className="section-title">인기 상품 ✨</h1>
                    <div className="card-grid">
                        {popularProducts.map((product) => (
                            <div
                                className="card"
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <img src={product.image} alt={product.title} className="card-image" />
                                <h2 className="card-title">{product.title}</h2>
                                <p className="card-description">{product.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 품 상품 */}
            <div className="category-container">
                <div className="category-wrapper">
                    <div className="category-section">
                        <h1 className="section-title">품 구경하기</h1>
                        <div className="category-list">
                            {mainCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="category-item"
                                    onClick={() => navigate(category.route)}
                                >
                                    <div className="category-icon">
                                        <div className="icon">{category.icon}</div>
                                    </div>
                                    <div className="category-name">{category.name}</div>
                                </div>
                            ))}
                        </div>
                        <hr className="divider" />
                    </div>

                    {/* 커미션 상품 */}
                    <div className="category-section">
                        <h1 className="section-title">커미션 구경하기</h1>
                        <div className="category-list">
                            {commissionCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="category-item"
                                    onClick={() => navigate(category.route)}
                                >
                                    <div className="category-icon">
                                        <div className="icon">{category.icon}</div>
                                    </div>
                                    <div className="category-name">{category.name}</div>
                                </div>
                            ))}
                        </div>
                        <hr className="divider" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
