import React, { useState, useEffect, useContext  } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CommissionDetail.css';
import api from '../../../api/api';
import { FaHeart } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { LoginContext } from "../../../contexts/LoginContext";

const CommissionDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams(); // URL 파라미터에서 id 추출

    const [commission, setCommission] = useState(null);
    const [description, setDescription] = useState("상품 설명이 없습니다.");
    const [activeTab, setActiveTab] = useState('상세 설명');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useContext(LoginContext);
    const [isLiked, setIsLiked] = useState(false);

    // 상세 데이터 불러오기
    useEffect(() => {
        const fetchCommissionDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/commission/post-detail/${id}`);
                const data = res.data;
                setCommission(data);
                setDescription(data.content || "상품 설명이 없습니다.");
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "커미션 상세 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCommissionDetail();
        } else {
            setError("잘못된 접근입니다. ID가 없습니다.");
            setLoading(false);
        }
    }, [id]);

    // 페이지 처음 로드 시 찜 여부 확인
    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (!userInfo || !id) return;

            try {
                const res = await api.get(`/commission-like/my-like/${id}`);
                // 응답이 있으면 무조건 true
                setIsLiked(true);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // 찜하지 않은 경우
                    setIsLiked(false);
                } else {
                    console.error("찜 상태 확인 실패:", error);
                    setIsLiked(false);
                }
            }
        };

        fetchLikeStatus();
    }, [id, userInfo]);


    useEffect(() => {
        console.log("isLiked 상태:", isLiked);
    }, [isLiked]);


    // 좋아요(찜) 토글
    const handleLikeToggle = async () => {
        if (!userInfo) {
            alert("로그인이 필요합니다.");
            return;
        }
        const url = `/commission-like/${commission.id}`;
        try {
            if (isLiked) {
                await api.delete(url);
            } else {
                await api.post(url);
            }
            setIsLiked(prev => !prev);
        } catch (error) {
            alert("찜 상태를 변경하는 데 실패했습니다.");
        }
    };


// 신고하기
    const handleReportClick = () => {
        navigate('/commissionReport', {
            state: {
                item: {
                    id: commission.id,
                    title: commission.title,
                    price: commission.minimumPrice ?? null,
                    condition: "커미션"
                },
                representativeImage: commission.thumbnailImage
            }
        });
    };

// 채팅하기
    const handleChatClick = async () => {
        const sellerId = commission.userId;
        console.log('commission ::: ',commission);
        if (!userInfo) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!sellerId) {
            alert("판매자 정보가 없습니다.");
            return;
        }
        if (userInfo.id === sellerId) {
            alert("자기 자신과는 채팅할 수 없습니다.");
            return;
        }
        try {
            const res = await api.post("/chatroom/create", {
                buyerId: userInfo.id,
                sellerId: sellerId
            });
            const roomData = res.data;
            window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
        } catch (error) {
            if (error.response && error.response.status === 409) {
                const roomData = error.response.data;
                window.open(`/chat-app?roomId=${roomData.id}`, "_blank", "width=1000,height=800,resizable=yes");
            } else {
                alert("채팅방 생성에 실패했습니다.");
            }
        }
    };

    const handleApplyClick = () => {
        if (commission?.id) {
            navigate('/commissionApplyWrite', {
                state: { id: commission.id }
            });
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    if (loading) {
        return <div className='container'><p>🔄 로딩 중입니다...</p></div>;
    }

    if (error) {
        return <div className='container'><p>❌ {error}</p></div>;
    }

    if (!commission) {
        return <div className='container'><p>해당 커미션 정보를 불러올 수 없습니다.</p></div>;
    }

    return (
        <div className='container'>
            <div className="commission-detail">
                <div className="image-and-info">
                    <img src={commission.thumbnailImage} alt={commission.title} className="keyring-image" />

                    <div className='commissionDetail-info'>
                        <h2>{commission.title}</h2>
                        <div className="subtitle">카테고리 : {commission.categoryName || "미지정"}</div>

                        <div className="tags">
                            {commission.hashtag?.split(",").map((tag, idx) => (
                                <span key={idx}>#{tag.trim()}</span>
                            ))}
                        </div>

                        <div className="price-box-updated">
                            <div className="price-item">
                                <span>최소 신청 금액</span>
                                <strong>{commission.minimumPrice?.toLocaleString()}원</strong>
                            </div>
                            <span className="price-separator">~</span>
                            <div className="price-item">
                                <span>최대 신청 금액</span>
                                <strong>{commission.maximumPrice?.toLocaleString()}원</strong>
                            </div>
                        </div>

                        <div className="commissionDetail-button-group">
                            <button className="btn-chat" onClick={handleChatClick}>💬 채팅하기</button>
                            <button className="btn-report" onClick={handleReportClick}>🚨 신고하기</button>
                            <button
                                className={`detail-like-button ${isLiked ? 'liked' : ''}`}
                                onClick={handleLikeToggle}
                            >
                                <FaHeart size={20} color={isLiked ? "red" : "gray"} />
                            </button>
                        </div>


                        <button className="btn-apply" onClick={handleApplyClick}>
                            신청하기
                        </button>
                    </div>
                </div>

                <div className="instruction">
                    <p>신청자는 아래 양식에 따라 입력해 주세요.</p>
                </div>

                <div className="form-box">
                    <h2>커미션 신청 양식</h2>
                    <div className="example">
                        {commission.commissionDetail?.map((form, idx) => (
                            <div key={idx} className='example-box'>
                                <p className='exampleTitle'>{idx + 1}. {form.title}</p>
                                <p className='examplDescription'>{form.reqContent}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='commissionDetailTabs'>
                    <ul>
                        <li
                            className={activeTab === '상세 설명' ? 'active' : ''}
                            onClick={() => handleTabClick('상세 설명')}
                        >
                            상세 설명
                        </li>
                        <li
                            className={activeTab === '리뷰' ? 'active' : ''}
                            onClick={() => handleTabClick('리뷰')}
                        >
                            리뷰
                        </li>
                    </ul>
                </div>

                <div className='commissionDetailTabContent'>
                    {activeTab === '상세 설명' ? (
                        <div className='commission-description'>
                            {description ? (
                                <div dangerouslySetInnerHTML={{ __html: description }} />
                            ) : (
                                <p>상품 설명이 없습니다.</p>
                            )}
                        </div>
                    ) : (
                        <div className="commission-review">
                            <p>리뷰가 준비 중입니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommissionDetail;
