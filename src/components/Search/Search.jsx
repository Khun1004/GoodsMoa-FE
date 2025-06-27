import React, { useState } from "react";
import { GoHome } from "react-icons/go";
import { IoMdSearch } from "react-icons/io";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import CommImage1 from '../../assets/commission/comm.png';
import CommImage2 from '../../assets/commission/comm2.png';
import CommImage3 from '../../assets/commission/comm3.png';
import CommImage4 from '../../assets/commission/comm4.png';
import Category from "../public/Category/Category";
import CommissionIcon from "../CommissionIcon/CommissionIcon";
import './Search.css';
import productService from '../../api/ProductService';

const popularProducts = [
    { id: 1, title: "상품 1", image: CommImage1, description: "설명 1" },
    { id: 2, title: "상품 2", image: CommImage2, description: "설명 2" },
    { id: 3, title: "상품 3", image: CommImage3, description: "설명 3" },
    { id: 4, title: "상품 4", image: CommImage4, description: "설명 4" },
];

const Search = () => {

    const categoryRoutes = {
        // From Category
        "창작캐릭터": "/category1",
        "창작공예/문구": "/category2",
        "인형/인형소품": "/category3",
        "순수창작": "/category/4",
        "패션/액세서리": "/category/5",
        "아이돌/스타": "/category/6",
        "만화/애니": "/category/7",
        "밀키트/식사": "/category/8",
        "게임": "/category/9",
        "영화": "/category/10",
        "드라마": "/category/11",
        "공연/행사": "/category/12",

        // From CommissionIcon
        "그림": "/paint",
        "글": "/writing",
        "기타": "/other",
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [noResultsFound, setNoResultsFound] = useState(false);
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchQuery.trim()) {
                try {
                    const data = await productService.searchIntegrated({
                        query: searchQuery,
                        orderBy: 'new',
                        includeExpired: false,
                        includeScheduled: false,
                        pageSize: 8
                    });

                    console.log('🔍 검색 결과:', data);

                    if (Object.keys(data).length > 0) {
                        navigate(`/search/results?q=${encodeURIComponent(searchQuery)}`, {
                            state: { results: data }
                        });
                        setNoResultsFound(false);
                    } else {
                        setNoResultsFound(true);
                    }

                } catch (error) {
                    console.error("검색 요청 실패:", error);
                    setNoResultsFound(true);
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

            {/* Import Category and Commission components */}
            <div className="formVisit">
                <h1 className="title">품 구경하기</h1>
                <Category />
            </div>

            <div className="commissionVisit">
                <h1 className="title">커미션 구경하기</h1>
                <CommissionIcon />
            </div>

        </div>
    );
};

export default Search;
