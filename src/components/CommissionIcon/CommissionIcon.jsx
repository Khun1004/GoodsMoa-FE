import React, {useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
// import "./CommissionIcon.css";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../public/Category/Category.css';

// const categories = [
//     { id: 1, name: "그림", icon: "🎨", route: "/paint" },
//     { id: 2, name: "글", icon: "✍️", route: "/writing" },
//     { id: 3, name: "기타", icon: "✨", route: "/other" },
// ];

const mainCategories = [
    { id: 0, name: "전체", icon: "😊" },
    { id: 9, name: "그림", icon: "🎨"},
    { id: 10, name: "글", icon: "✍️"},
    { id: 11, name: "기타", icon: "✨"},
];

const CommissionIcon = ({
                            title,
                            categories = mainCategories,
                            gap=70,
                            onCategoryClick,
                            selectedId,
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


    // const handleCategoryClick = (route) => {
    //     navigate(route);
    // };

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
                    // 필요하다면 ref, gap 등 추가 가능
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


export default CommissionIcon;
