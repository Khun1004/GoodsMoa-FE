import React from 'react';
import { FaStar } from 'react-icons/fa';
import Img1 from '../../assets/shirt/shirt.png';
import Img2 from '../../assets/shirt/shirt2.png';
import Img3 from '../../assets/shirt/shirt3.png';
import './TopProducts.css';
const ProductsData = [
    {
        id: 1,
        img: Img1,
        title: "Casual Wear",
        description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        id: 2,
        img: Img2,
        title: "Printed shirt",
        description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        id: 3,
        img: Img3,
        title: "Women shirt",
        description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
];

const TopProducts = ({handleOrderPopup}) => {
    return (
        <div className="top-products-container">
            {/* Header section */}
            <div className="header-section">
                <p data-aos="fade-up" className="header-subtitle">Top Rated Products for you</p>
                <h1 data-aos="fade-up" className="header-title">Best Products</h1>
                <p data-aos="fade-up" className="header-description">
                    Lorem ipsum dolor sit amet, consectetur, adipisicing elit.
                    Animi sint ipsa voluptates molestiae laborum eaque quibusdam voluptatem
                    fugit quis veniam, voluptatum, aut eos dolorum. Ab fugiat quisquam ut delectus qui.
                </p>
            </div>
            {/* Body section */}
            <div className="product-grid">
                {ProductsData.map((data) => (
                    <div key={data.id} data-aos="zoom-in" className="product-card">
                        {/* Image section */}
                        <div className="image-section">
                            <img src={data.img} alt={data.title} className="product-image" />
                        </div>
                        {/* Details section */}
                        <div className="product-details">
                            {/* Star rating */}
                            <div className="rating">
                                <FaStar className="star-icon" />
                                <FaStar className="star-icon" />
                                <FaStar className="star-icon" />
                                <FaStar className="star-icon" />
                            </div>
                            <h1 className="product-title">{data.title}</h1>
                            <p className="product-description">{data.description}</p>
                            <button 
                                className="order-button"
                                onClick={handleOrderPopup}
                            >
                                Order Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopProducts;
