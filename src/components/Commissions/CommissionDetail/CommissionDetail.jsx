import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CommissionDetail.css';
import api from '../../../api/api'; // api 인스턴스 경로 확인 후 맞게 조정

const CommissionDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams(); // URL 파라미터에서 id 추출

    const [commission, setCommission] = useState(null);
    const [description, setDescription] = useState("상품 설명이 없습니다.");
    const [activeTab, setActiveTab] = useState('상세 설명');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleApplyClick = () => {
        if (commission) {
            navigate('/commissionApplyWrite', {
                state: {
                    commission: {
                        ...commission,
                        description,
                        sections: commission.commissionDetail?.map((form, idx) => ({
                            title: `${idx + 1}. ${form.title}`,
                            description: form.reqContent
                        })) || []
                    }
                }
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
                            <button className="btn-like">찜</button>
                            <button className="btn-chat">채팅하기</button>
                            <button className="btn-report">🚨 신고하기</button>
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
