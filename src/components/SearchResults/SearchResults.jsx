import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productService from "../../api/ProductService";
import { IoMdSearch } from "react-icons/io";
import "./SearchResults.css";

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialQueryFromLocation = new URLSearchParams(location.search).get("q") || "";
    const [searchQuery, setSearchQuery] = useState(initialQueryFromLocation);
    const [searchType, setSearchType] = useState("전체");
    const [activeTab, setActiveTab] = useState("상품");
    const [currentPage, setCurrentPage] = useState(1);
    const [rawResults, setRawResults] = useState({});
    const abortControllerRef = useRef(null);

    const postsPerPage = 25;
    const tabKeyMap = { "상품": "PRODUCT", "중고거래": "TRADE", "수요조사": "DEMAND" };
    const searchTypeMap = { "전체": "ALL", "제목": "TITLE", "내용": "DESCRIPTION", "해시태그": "HASHTAG" };
    const tabs = ["상품", "중고거래", "수요조사"];

    // 통합 검색 결과
    const fetchSearchResults = async () => {
        if (abortControllerRef.current) {
            // 이전 요청 중단
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const result = await productService.searchIntegrated({
                query: searchQuery || "",
                searchType: searchTypeMap[searchType],
                boardType: tabKeyMap[activeTab],
                page: currentPage - 1
            }, { signal: controller.signal });
            console.log('result ::: ',result);

            const newResults = {
                [tabKeyMap[activeTab]]: result.content || []
            };
            setRawResults(newResults);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("⛔ 요청 취소됨 (최신 요청 유지)");
            } else {
                console.error('🔍 검색 중 오류:', error);
            }
        }
    };

    useEffect(() => {
        fetchSearchResults();
    }, [activeTab, currentPage, searchType]);

    // 각 카드 클릭 시 해당 상품 상세조회로 넘어감
    const handleCardClick = async (post) => {
        const { id, boardType } = post;
        const numericId = id.split("_")[1]; // 'PRODUCT_29' → '29'

        if (boardType === "상품판매") {
            try {
                const fullProduct = await productService.getPostDetail(numericId);
                const imageUrl = fullProduct.thumbnailImage || fullProduct.image || fullProduct.src || null;
                navigate("/person", {
                    state: {
                        product: fullProduct,
                        products: [fullProduct], // 필요시
                        selectedImage: imageUrl // 추가
                    }
                });
            } catch (err) {
                console.error("상품 상세 조회 실패:", err);
                alert("상품 상세 정보를 가져오는데 실패했습니다.");
            }
        } else if (boardType === "중고거래") {
            navigate(`/tradeDetail/${numericId}`);
        } else if (boardType === "수요조사") {
            navigate(`/demandDetail/${numericId}`);
        } else {
            console.error("알 수 없는 boardType:", boardType);
        }
    };


    const handleSearchSubmit = () => {
        setCurrentPage(1);
        // URL 업데이트 (뒤로가기 시 검색 유지)
        navigate(`/search/results?q=${encodeURIComponent(searchQuery)}`, { replace: true });
        fetchSearchResults();
    };

    const posts = rawResults[tabKeyMap[activeTab]] || [];
    const filteredPosts = posts;
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.max(Math.ceil(filteredPosts.length / postsPerPage), 1);

    const getTabColorClass = (tab) => {
        if (tab === "상품") return "green";
        if (tab === "중고거래") return "red";
        if (tab === "수요조사") return "purple";
        return "";
    };

    return (
        <div className="search-results-wrapper">
            {/* 검색 바 */}
            <div className="search-banner">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-banner-select"
                >
                    <option value="전체">전체</option>
                    <option value="제목">제목</option>
                    <option value="내용">내용</option>
                    <option value="해시태그">해시태그</option>
                </select>
                <div className="search-banner-input-wrapper">
                    <input
                        type="text"
                        placeholder={`${searchType} 검색`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit();
                        }}
                        className="search-banner-input"
                    />
                </div>
                <button
                    onClick={handleSearchSubmit}
                    className="search-banner-button"
                >
                    <IoMdSearch />
                </button>
            </div>

            {/* 탭 */}
            <div className="tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab-button ${activeTab === tab ? `active ${getTabColorClass(tab)}` : ""}`}
                        onClick={() => {
                            setActiveTab(tab);
                            setCurrentPage(1);
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 카드 그리드 */}
            <div className="cards-grid">
                {currentPosts.map((post, index) =>
                    post ? (
                        <div
                            key={post.id || index}
                            className="card-item"
                            onClick={() => handleCardClick(post)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="card-thumbnail">
                                <img
                                    src={post.thumbnailUrl}
                                    alt={post.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop";
                                    }}
                                />
                            </div>
                            <div className="card-content">
                                <h3>{post.title}</h3>
                                {post.hashtag && <p>#{post.hashtag}</p>}
                                {post.nickname && <p>{post.nickname}</p>}
                            </div>
                        </div>
                    ) : (
                        <div key={`empty-${index}`} className="card-item empty-card"></div>
                    )
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ◀
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={currentPage === i + 1 ? "active" : ""}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    ▶
                </button>
            </div>
        </div>
    );
};

export default SearchResults;
