import React, { useEffect, useRef, useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import Image1 from '../../assets/commission/comm.png';
import Image2 from '../../assets/commission/comm2.png';
import Image3 from '../../assets/commission/comm3.png';
import Image4 from '../../assets/commission/comm4.png';
import "./Other.css";

function MyPage() {
    const hiddenFileInput = useRef(null);

    // Load initial state from localStorage
    const [image, setImage] = useState(() => localStorage.getItem("profileImage"));
    const [userName, setUserName] = useState(() => localStorage.getItem("profileName") || "프로필");
    const [description, setDescription] = useState(() =>
        localStorage.getItem("profileDescription") ||
        "구매자에게 보여주는 자기소개 자리 입니다. \n구매자들이 자기소개를 보고 판매자가 어떤 물건을 파는지 파악하는 용도 입니다."
    );
    const [verified, setVerified] = useState(() => {
        const storedImage = localStorage.getItem("profileImage");
        const storedName = localStorage.getItem("profileName");
        const storedDescription = localStorage.getItem("profileDescription");
        return !!(storedImage && storedName && storedDescription);
    });

    const [activeTab, setActiveTab] = useState("판매 중인 상품");

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result;
                setImage(newImage);
                localStorage.setItem("profileImage", newImage); // Save to localStorage
                setVerified(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setImage(null);
        localStorage.removeItem("profileImage");
        setVerified(false);
    };

    const handleClick = () => {
        hiddenFileInput.current.click();
    };

    const handleUserNameChange = (event) => {
        const newName = event.target.value;
        setUserName(newName);
        localStorage.setItem("profileName", newName);
        setVerified(false);
    };

    const handleDescriptionChange = (event) => {
        const newDescription = event.target.value;
        setDescription(newDescription);
        localStorage.setItem("profileDescription", newDescription);
        setVerified(false);
    };

    const handleChatClick = () => {
        alert("판매자랑 체팅하시겠습니까?");
    };

    useEffect(() => {
        if (image && userName.trim() !== "" && description.trim() !== "") {
            setVerified(true);
        } else {
            setVerified(false);
        }
    }, [image, userName, description]);

    return (
        <div className="mypage-container">
            <div className="profile-section">
                <div className="profile-picture">
                {image ? (
                    <div className="image-wrapper">
                        <img src={image} alt="Profile" className="profile-image" />
                        {/* 마우스를 올릴 때 표시되는 버튼 */}
                        <div className="overlay">
                            <button className="overlay-button" onClick={handleClick}>
                                사진 변경
                            </button>
                            <button className="overlay-button" onClick={handleDeleteImage}>
                                사진 삭제
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder-image" onClick={handleClick}>
                        사진 추가
                    </div>
                )}
                    <input
                        type="file"
                        ref={hiddenFileInput}
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                    />
                </div>
                <input
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange}
                    className="user-name-input"
                />
                <div className="verification">
                    <span>본인 인증 완료</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={verified}
                            readOnly
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="chat-section">
                    <button className="chat-button" onClick={handleChatClick}>
                        <FaCommentDots className="chat-icon" /> 판매자랑 체팅하기
                    </button>
                </div>

                <textarea
                    className="user-description"
                    value={description}
                    onChange={handleDescriptionChange}
                />
            </div>

            <div className="tabs">
                {["판매 중인 상품", "판매 완료 상품", "커뮤니티"].map((tabName) => (
                    <button
                        key={tabName}
                        className={`tab ${activeTab === tabName ? "active" : ""}`}
                        onClick={() => handleTabClick(tabName)}
                    >
                        {tabName}
                    </button>
                ))}
            </div>

            <div className="content-section">
                {activeTab === "판매 중인 상품" && (
                    <div className="product-section">
                        <div className="product-item">
                            <img src={Image1} alt="상품 1" />
                        </div>
                        <div className="product-item">
                            <img src={Image2} alt="상품 2" />
                        </div>
                        <div className="product-item">
                            <img src={Image3} alt="상품 3" />
                        </div>
                        <div className="product-item">
                            <img src={Image4} alt="상품 4" />
                        </div>
                    </div>
                )}
                {activeTab === "판매 완료 상품" && (
                    <div className="product-section">
                        <div className="product-item">
                            <img src={Image1} alt="상품 1" />
                        </div>
                        <div className="product-item">
                            <img src={Image2} alt="상품 2" />
                        </div>
                    </div>
                )}
                {activeTab === "커뮤니티" && (
                    <div className="product-section">
                        <div className="product-item">
                            <img src={Image3} alt="상품 3" />
                        </div>
                        <div className="product-item">
                            <img src={Image4} alt="상품 4" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPage;
