import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Category.css';

const mainCategories = [
    { id: 1, name: "창작캐릭터", icon: "🐱", route: "/category1" },
    { id: 2, name: "창작공예/문구", icon: "😊", route: "/category2" },
    { id: 3, name: "인형/인형소품", icon: "🧸", route: "/category3" },
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

const Category = ({ title, categories = mainCategories }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const handleCategoryClick = (route) => {
        navigate(route);
    };

    const checkScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
    };

    const scrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            }
        };
    }, []);

    return (
        <div className='container'>
            <div className="categoryMain-section">
                <div className="scroll-container">
                    {showLeftArrow && (
                        <button className="scroll-button left" onClick={scrollLeft}>
                            <div className="arrow-circle">
                                <FaChevronLeft />
                            </div>
                        </button>
                    )}
                    <div className="categoryMain-list" ref={containerRef}>
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="categoryMain-item"
                                onClick={() => handleCategoryClick(category.route)}
                            >
                                <div className="categoryMain-icon">
                                    <div className="categoryMain-icons">{category.icon}</div>
                                </div>
                                <div className="categoryMain-name">{category.name}</div>
                            </div>
                        ))}
                    </div>
                    {showRightArrow && (
                        <button className="scroll-button right" onClick={scrollRight}>
                            <div className="arrow-circle">
                                <FaChevronRight />
                            </div>
                        </button>
                    )}
                </div>
                <hr className="divider" />
            </div>
        </div>
    );
};

export default Category;