import React, { useState, useEffect } from 'react';
import ManagementCard from '../../../public/management/ManagementCard';
import { Eye, Lock, Tag, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CommissionApplyList.css';
import api from "../../../../api/api";

const CommissionApplyList = () => {
    const [selectedType, setSelectedType] = useState('received');
    const [cards, setCards] = useState([]);
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    const statusMap = {
        확인중: {
            type: 'pending',
            text: '확인중',
            icon: <Eye size={14} />
        },
        진행중: {
            type: 'in-progress',
            text: '진행중',
            icon: <Calendar size={14} />
        },
        완료: {
            type: 'done',
            text: '완료',
            icon: <CheckCircle size={14} />
        },
        거절: {
            type: 'rejected',
            text: '거절',
            icon: <XCircle size={14} />
        }
    };

    const fetchCards = async (type) => {
        try {
            const endpoint = type === 'received'
                ? '/commission/received-list'
                : '/commission/subscription-list';
            const res = await api.get(endpoint);
            setCards(res.data.content);
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchCards(selectedType);
    }, [selectedType]);

    const getFooterText = (status) => {
        switch (status) {
            case '확인중':
                return '검토 중';
            case '진행중':
                return '진행 중';
            case '완료':
            case '거절':
                return '완료';
            default:
                return '상태 없음';
        }
    };

    return (
        <div className="commission-list-container">
            <div className="apply-type-selection">
                <button
                    className={`apply-type-btn ${selectedType === 'received' ? 'selected' : ''}`}
                    onClick={() => setSelectedType('received')}
                >
                    요청받은 목록
                </button>
                <button
                    className={`apply-type-btn ${selectedType === 'applied' ? 'selected' : ''}`}
                    onClick={() => setSelectedType('applied')}
                >
                    신청한 목록
                </button>
            </div>

            <div className="card-grid">
                {cards.map((card) => {
                    const status = statusMap[card.requestStatus] || statusMap['확인중'];

                    return (
                        <ManagementCard
                            key={card.id}
                            item={card}
                            statusType={status.type}
                            statusIcon={status.icon}
                            statusText={status.text}
                            badges={[
                                { icon: <Tag size={14} />, text: card.categoryName || '미분류' },
                                {
                                    icon: <Calendar size={14} />,
                                    text: card.createdAt
                                        ? formatDate(card.createdAt)
                                        : '날짜 없음'
                                },
                                selectedType === 'received'
                                    ? { icon: <User size={14} />, text: `신청자: ${card.applicantName}` }
                                    : { icon: <User size={14} />, text: `판매자: ${card.sellerName}` }
                            ]}
                            footerText={getFooterText(card.requestStatus)}
                            onCardClick={() => {
                                navigate(`/mypage?page=commissionApplyDetail&id=${card.id}&type=${selectedType}`);
                                if (windowWidth <= 768) {
                                    // 필요하다면 메뉴 닫기 로직을 여기에 추가하거나 상위에서 prop으로 받아도 됨
                                }
                            }}
                            actionButtons={null}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default CommissionApplyList;
