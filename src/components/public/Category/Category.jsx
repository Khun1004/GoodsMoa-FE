// Category.jsx
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Category.css';
import Divider from '../Divider.jsx';

const mainCategories = [
    { id: 0, name: "전체", icon: "😊" },
    { id: 1, name: "애니메이션", icon: "🎬" },
    { id: 2, name: "아이돌", icon: "🎤" },
    { id: 3, name: "순수창작", icon: "🎨" },
    { id: 4, name: "게임", icon: "🎮" },
    { id: 5, name: "영화", icon: "🎞️" },
    { id: 6, name: "드라마", icon: "📺" },
    { id: 7, name: "웹소설", icon: "📖" },
    { id: 8, name: "웹툰", icon: "💬" },
];

const Category = ({
                      title,
                      categories = mainCategories,
                      gap = 70,
                      onCategoryClick,
                      selectedId,      // 선택된 카테고리 id
                  }) => {
    const containerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const handleCategoryClick = (id) => {
        if (onCategoryClick) {
            onCategoryClick(id);
        }
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
        <div className="categoryMain-section">
            <div className="scroll-container">
                {showLeftArrow && (
                    <button className="scroll-button left" onClick={scrollLeft}>
                        <div className="arrow-circle">
                            <FaChevronLeft />
                        </div>
                    </button>
                )}
                <div
                    className="categoryMain-list"
                    ref={containerRef}
                    style={{ gap: `${gap}px` }}
                >
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className={
                                "categoryMain-item" +
                                (selectedId === category.id ? " selected" : "")
                            }
                            onClick={() => handleCategoryClick(category.id)}
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
        </div>
    );
};

export default Category;
