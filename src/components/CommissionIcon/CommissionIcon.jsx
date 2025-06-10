import React from "react";
import { useNavigate } from "react-router-dom";
import "./CommissionIcon.css";

const categories = [
    { id: 1, name: "그림", icon: "🎨", route: "/paint" },
    { id: 2, name: "글", icon: "✍️", route: "/writing" },
    { id: 3, name: "기타", icon: "✨", route: "/other" },
];

const CommissionIcon = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (route) => {
        navigate(route);
    };

    return (
        
        <div className="commission-icon-container">
            <div className="category-list">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category-item"
                        onClick={() => handleCategoryClick(category.route)}
                    >
                        <div className="category-icon">
                            <span className="text-2xl">{category.icon}</span>
                        </div>
                        <div className="category-name">{category.name}</div>
                    </div>
                ))}
            </div>
            <hr className="divider" />
        </div>
        
    );
};


export default CommissionIcon;
