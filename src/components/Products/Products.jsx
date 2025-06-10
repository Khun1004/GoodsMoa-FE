import React, { useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FcLike } from "react-icons/fc";
import MainProImage from '../../assets/products/products.jpg';
import { default as Img1, default as Img8 } from '../../assets/women/women.png';
import { default as Img2, default as Img5 } from '../../assets/women/women2.jpg';
import { default as Img3, default as Img6 } from '../../assets/women/women3.jpg';
import { default as Img4, default as Img7 } from '../../assets/women/women4.jpg';
import './Products.css';

const ProductsData = [
    { id: 1, img: Img1, views: 1200 },
    { id: 2, img: Img2, views: 950 },
    { id: 3, img: Img3, views: 800 },
    { id: 4, img: Img4, views: 1500 },
    { id: 5, img: Img5, views: 1100 },
    { id: 6, img: Img6, views: 700 },
    { id: 7, img: Img7, views: 1300 },
    { id: 8, img: Img8, views: 600 },
    { id: 9, img: Img1, views: 900 },
    { id: 10, img: Img2, views: 850 },
    { id: 11, img: Img3, views: 750 },
    { id: 12, img: Img4, views: 950 },
];

const Products = () => {
    const [userName, setUserName] = useState(localStorage.getItem("profileName") || "사용자");
    const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
    
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                localStorage.setItem("profileImage", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='container'>
            <div className='products-container'>
                <div className='products-header'>
                    <FcLike className="recom-icon" />
                    <h1 className='productsTitle'>굿즈모아의 추천</h1>
                </div>
                <div className='products-content'>
                    <div className='products-left'>
                        <img src={MainProImage} alt="Products" className='main-product-image' />
                        <div className="profile-info">
                            <label className="product-user-profile">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" />
                                ) : (
                                    <CgProfile className="profile-icon" />
                                )}
                            </label>
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input"
                                style={{ display: 'none' }}
                            />
                            <span className="username"> {userName}</span>
                            <span className="views">{ProductsData[0]?.views} 조회</span>
                        </div>
                    </div>
                    <div className='products-section'>
                        <div className='products-grid'>
                            {ProductsData.map((data) => (
                                <div key={data.id} className='products-cards'>
                                    <img src={data.img} alt="" className='products-image' />
                                    <div className='product-info'>
                                        <CgProfile className='profile-icon' />
                                        <span className='username'>User Name</span>
                                        <span className='views'>{data.views} 조회</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="divider"></hr>
        </div>
    );
};

export default Products;