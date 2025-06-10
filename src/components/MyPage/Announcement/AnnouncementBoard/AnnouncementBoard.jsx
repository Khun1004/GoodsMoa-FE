import React, { useEffect, useState } from 'react';
import AnnouncementForm from '../AnnouncementForm/AnnouncementForm';
import './AnnouncementBoard.css';

// 공지사항을 로컬 스토리지에 저장/불러오기 위한 키
const STORAGE_KEY = 'announcements';

const AnnouncementBoard = () => {
    const [showForm, setShowForm] = useState(false);
    
    // 초기 데이터를 설정하고, 로컬 스토리지에서 데이터 불러오기
    const [announcements, setAnnouncements] = useState(() => {
        const savedAnnouncements = localStorage.getItem(STORAGE_KEY);
        if (savedAnnouncements) {
            return JSON.parse(savedAnnouncements);
        }
        
        // 초기 기본 데이터
        return [
            {
                id: 1,
                title: '시스템 점검 안내',
                content: '2025년 5월 3일 오전 2시부터 오전 5시까지 시스템 점검이 예정되어 있습니다. 해당 시간에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.',
                date: '2025-05-01',
                isImportant: true,
            },
            {
                id: 2,
                title: '새로운 기능 업데이트 안내',
                content: '사용자 경험 개선을 위한 새로운 기능이 추가되었습니다. 자세한 내용은 공지사항을 확인해 주세요.',
                date: '2025-04-28',
                isImportant: false,
            },
            {
                id: 3,
                title: '개인정보 처리방침 변경 안내',
                content: '2025년 6월 1일부터 개인정보 처리방침이 변경됩니다. 자세한 내용은 홈페이지에서 확인하실 수 있습니다.',
                date: '2025-04-25',
                isImportant: true,
            },
        ];
    });
    
    const [expandedItems, setExpandedItems] = useState({});

    // 공지사항이 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
        
        // 커스텀 이벤트를 발생시켜 Notice 컴포넌트에 알림
        const event = new CustomEvent('announcementsUpdated', { 
            detail: { announcements } 
        });
        window.dispatchEvent(event);
    }, [announcements]);

    const handleAddAnnouncement = (newAnnouncement) => {
        setAnnouncements([newAnnouncement, ...announcements]);
        setShowForm(false);
    };

    const handleDeleteAnnouncement = (id) => {
        setAnnouncements(announcements.filter(announcement => announcement.id !== id));
    };

    const toggleExpand = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="announcement-container">
            {showForm ? (
                <AnnouncementForm
                    onAddAnnouncement={handleAddAnnouncement}
                    onClose={() => setShowForm(false)}
                />
            ) : (
                <div className="announcement-board">
                    <div className="announcement-board-header">
                        <div className="header-title">
                            <div className="bell-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                            </div>
                            <h2>공지사항</h2>
                        </div>
                        <button
                            className="announcement-board-add-button"
                            onClick={() => setShowForm(true)}
                            aria-label="공지사항 추가"
                        >
                            공지사항 추가
                        </button>
                    </div>
                    
                    {announcements.length > 0 ? (
                        <div className="announcement-list">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className={`announcement-item ${announcement.isImportant ? 'important' : ''}`}>
                                    <div className="announcement-header" onClick={() => toggleExpand(announcement.id)}>
                                        <div className="title-container">
                                            {announcement.isImportant && <span className="important-icon">!</span>}
                                            <h3 className="announcement-title">{announcement.title}</h3>
                                        </div>
                                        <div className="announcement-meta">
                                            <span className="announcement-date">{announcement.date}</span>
                                            <span className={`chevron ${expandedItems[announcement.id] ? 'expanded' : ''}`}>›</span>
                                            <button
                                                className="delete-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAnnouncement(announcement.id);
                                                }}
                                                aria-label="공지사항 삭제"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>

                                    {expandedItems[announcement.id] && (
                                        <div className="announcement-content">
                                            <div className="content-date">
                                                <svg className="calendar-icon" viewBox="0 0 24 24" width="16" height="16">
                                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{announcement.date}</span>
                                            </div>
                                            <p>{announcement.content}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-announcements">
                            <p>등록된 공지사항이 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnnouncementBoard;