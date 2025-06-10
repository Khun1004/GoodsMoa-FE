import React, { useEffect, useState } from "react";
import { BsBellFill } from "react-icons/bs";

// 공지사항을 로컬 스토리지에서 불러오기 위한 키
const STORAGE_KEY = 'announcements';
// 읽은 공지사항 ID를 저장하는 키
const READ_NOTICES_KEY = 'read_announcements';

const Notice = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    // 공지사항 상태 관리
    const [announcements, setAnnouncements] = useState(() => {
        const savedAnnouncements = localStorage.getItem(STORAGE_KEY);
        if (savedAnnouncements) {
            return JSON.parse(savedAnnouncements);
        }
        return [];
    });
    
    // 읽은 공지사항 ID 목록
    const [readNotices, setReadNotices] = useState(() => {
        const savedReadNotices = localStorage.getItem(READ_NOTICES_KEY);
        if (savedReadNotices) {
            return JSON.parse(savedReadNotices);
        }
        return [];
    });
    
    // 읽지 않은 공지사항 수 계산
    const unreadCount = announcements.filter(
        announcement => !readNotices.includes(announcement.id)
    ).length;
    
    // 패널을 열 때 모든 공지사항을 읽음 처리
    const handleOpenPanel = () => {
        const noticeIds = announcements.map(announcement => announcement.id);
        setReadNotices(noticeIds);
        localStorage.setItem(READ_NOTICES_KEY, JSON.stringify(noticeIds));
        setIsOpen(true);
    };
    
    // AnnouncementBoard에서 공지사항이 업데이트될 때 동기화
    useEffect(() => {
        // 로컬 스토리지 변경 감지
        const handleStorageChange = () => {
            const savedAnnouncements = localStorage.getItem(STORAGE_KEY);
            if (savedAnnouncements) {
                setAnnouncements(JSON.parse(savedAnnouncements));
            }
        };
        
        // 커스텀 이벤트 감지
        const handleAnnouncementsUpdated = (event) => {
            setAnnouncements(event.detail.announcements);
        };
        
        // 이벤트 리스너 등록
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('announcementsUpdated', handleAnnouncementsUpdated);
        
        // 클린업 함수
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('announcementsUpdated', handleAnnouncementsUpdated);
        };
    }, []);
    
    // 최신 공지사항 3개만 표시
    const latestAnnouncements = announcements.slice(0, 3);
    
    return (
        <>
            {/* 공지사항 버튼 (하단) */}
            <div
                data-aos="zoom-in"
                className="fixed top-[60%] right-4 transform -translate-y-1/2 bg-blue-100
                shadow-lg rounded-2xl flex flex-col items-center justify-center w-20 h-20
                hover:shadow-xl transition-all duration-300 dark:bg-gray-900 cursor-pointer"
                style={{ zIndex: 1000 }}
                onClick={handleOpenPanel}
            >
                <div className="relative">
                    <BsBellFill className="text-3xl text-red-500" />
                    {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold
                        rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}
                </div>
                <span className="text-sm mt-1">공지사항</span>
            </div>
            
            {/* 공지사항 패널 */}
            {isOpen && (
                <div
                    className="fixed right-28 top-1/2 transform -translate-y-1/2 bg-white
                    dark:bg-gray-800 shadow-xl rounded-lg p-4 w-80 max-h-96 overflow-y-auto"
                    style={{ zIndex: 1001 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">공지사항</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-3">
                        {latestAnnouncements.length > 0 ? (
                            latestAnnouncements.map((announcement) => (
                                <div key={announcement.id} className="p-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        {announcement.isImportant && (
                                            <span className="bg-red-500 text-white text-xs px-1 rounded mr-1">중요</span>
                                        )}
                                        <h4 className="font-semibold">{announcement.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {announcement.content.length > 100 
                                            ? `${announcement.content.substring(0, 100)}...` 
                                            : announcement.content
                                        }
                                    </p>
                                    <span className="text-xs text-gray-500">{announcement.date}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-center text-gray-500">
                                등록된 공지사항이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Notice;