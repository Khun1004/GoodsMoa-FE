import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import GoodsMoa from "../../assets/profilephoto.jpg";
import "./Modal.css";

const Modal = ({ closeModal }) => {
    const [stars, setStars] = useState([]);
    const [hoverTimers, setHoverTimers] = useState({});
    
    // Handle OAuth requests with redirection
    const handleKakaoLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
    };
    
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };
    
    const handleNaverLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/naver";
    };
    
    // Create stars animation with hover effect
    const createStars = (buttonId, rect) => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const newStars = [];
        // Create 15-20 stars for hover effect (fewer than click effect)
        const starCount = Math.floor(Math.random() * 6) + 15;
        
        for (let i = 0; i < starCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 30; // Shorter distance for hover
            const duration = Math.random() * 0.8 + 0.6;
            const size = Math.random() * 8 + 3; // Slightly smaller stars
            const delay = Math.random() * 0.2;
            
            // Calculate position relative to button
            const startOffsetX = (Math.random() - 0.5) * rect.width * 0.8;
            const startOffsetY = (Math.random() - 0.5) * rect.height * 0.8;
            
            newStars.push({
                id: Date.now() + i,
                buttonId,
                left: centerX + startOffsetX,
                top: centerY + startOffsetY,
                targetX: centerX + Math.cos(angle) * distance,
                targetY: centerY + Math.sin(angle) * distance,
                size,
                duration,
                delay,
                color: getRandomColor(buttonId),
                rotation: Math.random() * 360,
            });
        }
        
        setStars(prevStars => [...prevStars, ...newStars]);
        
        // Remove stars after animation
        setTimeout(() => {
            setStars(currentStars => 
                currentStars.filter(star => !newStars.some(newStar => newStar.id === star.id))
            );
        }, 2000);
        
        return newStars;
    };
    
    const getRandomColor = (buttonId) => {
        // Different color palettes for each button
        const colorPalettes = {
            kakao: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00', '#DAA520'],
            google: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B68EE'],
            naver: ['#32CD32', '#00FF00', '#7FFF00', '#98FB98', '#00FA9A']
        };
        
        const palette = colorPalettes[buttonId] || 
            ['#FFD700', '#FFA500', '#FF69B4', '#00BFFF', '#7B68EE'];
            
        return palette[Math.floor(Math.random() * palette.length)];
    };
    
    // Handle mouse enter for buttons
    const handleMouseEnter = (e, buttonId) => {
        const rect = e.currentTarget.getBoundingClientRect();
        
        // Set interval to continuously create stars while hovering
        const timerId = setInterval(() => {
            createStars(buttonId, rect);
        }, 300);
        
        setHoverTimers(prev => ({
            ...prev,
            [buttonId]: timerId
        }));
    };
    
    // Handle mouse leave for buttons
    const handleMouseLeave = (buttonId) => {
        if (hoverTimers[buttonId]) {
            clearInterval(hoverTimers[buttonId]);
            setHoverTimers(prev => {
                const newTimers = {...prev};
                delete newTimers[buttonId];
                return newTimers;
            });
        }
    };
    
    // Enhanced click effect with more stars
    const handleButtonClick = (e, buttonId) => {
        const rect = e.currentTarget.getBoundingClientRect();
        
        // Create more stars on click (35-50)
        const newStars = [];
        const starCount = Math.floor(Math.random() * 16) + 35;
        
        for (let i = 0; i < starCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 50;
            const duration = Math.random() * 0.8 + 0.6;
            const size = Math.random() * 12 + 4;
            const delay = Math.random() * 0.2;
            
            newStars.push({
                id: Date.now() + i + 1000, // Ensure unique IDs
                buttonId,
                left: rect.left + rect.width / 2,
                top: rect.top + rect.height / 2,
                targetX: rect.left + rect.width / 2 + Math.cos(angle) * distance,
                targetY: rect.top + rect.height / 2 + Math.sin(angle) * distance,
                size,
                duration,
                delay,
                color: getRandomColor(buttonId),
                rotation: Math.random() * 360,
            });
        }
        
        setStars(prevStars => [...prevStars, ...newStars]);
        
        setTimeout(() => {
            setStars(currentStars => 
                currentStars.filter(star => !newStars.some(newStar => newStar.id === star.id))
            );
        }, 2000);
    };
    
    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };
        
        window.addEventListener("keydown", handleEscKey);
        
        // Prevent body scrolling when modal is open
        document.body.style.overflow = "hidden";
        
        // Clear all timers on unmount
        return () => {
            window.removeEventListener("keydown", handleEscKey);
            document.body.style.overflow = "auto";
            
            // Clean up all hover timers
            Object.values(hoverTimers).forEach(timerId => {
                clearInterval(timerId);
            });
        };
    }, [closeModal, hoverTimers]);
    
    return (
        <div className="modals-overlay">
            <div className="modal-container">
                <h1 className="modal-header">GoodsMoa</h1>
                <p className="modal-text">안녕하세요! 굿즈모아 입니다.</p>
                <p className="modal-text">굿즈모아를 이용하시려면 로그인이 필요합니다.</p>
                <div className="modal-image">
                    <img src={GoodsMoa} alt="GoodsMoa" />
                </div>
                <div className="login-buttons">
                    <button 
                        className="login-button kakao-login" 
                        onClick={(e) => {
                            handleButtonClick(e, "kakao");
                            setTimeout(handleKakaoLogin, 800);
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, "kakao")}
                        onMouseLeave={() => handleMouseLeave("kakao")}
                    >
                        <RiKakaoTalkFill />
                        카카오로 로그인
                    </button>
                    <button 
                        className="login-button google-login" 
                        onClick={(e) => {
                            handleButtonClick(e, "google");
                            setTimeout(handleGoogleLogin, 800);
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, "google")}
                        onMouseLeave={() => handleMouseLeave("google")}
                    >
                        <FcGoogle />
                        구글로 로그인
                    </button>
                    <button 
                        className="login-button naver-login" 
                        onClick={(e) => {
                            handleButtonClick(e, "naver");
                            setTimeout(handleNaverLogin, 800);
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, "naver")}
                        onMouseLeave={() => handleMouseLeave("naver")}
                    >
                        <SiNaver />
                        네이버로 로그인
                    </button>
                </div>
            </div>
            
            {/* Star animations */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        position: 'fixed',
                        left: `${star.left}px`,
                        top: `${star.top}px`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: 'transparent',
                        transform: `rotate(${star.rotation}deg)`,
                        zIndex: 9999,
                        opacity: 1,
                        animation: `fly-out ${star.duration}s ${star.delay}s forwards`,
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        className="star-inner"
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(star.color)}'%3E%3Cpath d='M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 10.14 2 5.27l6.91-1.01L12 1z'/%3E%3C/svg%3E")`,
                            backgroundSize: 'contain',
                            animation: `twinkle 0.6s infinite alternate`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default Modal;