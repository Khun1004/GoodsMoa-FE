import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import backgroundImg from '../../../assets/GoodsMoa1.png';
import BlockedList from "../../BlockedList/BlockedList";
import CustomerService from "../../CustomerService/CustomerService";
import CustomerServiceReply from "../../CustomerServiceReply/CustomerServiceReply";
import AdminDemandManage from "../../Demands/AdminDemandManage/AdminDemandManage";
import DemandParticipate from "../../Demands/DemandParticipate/DemandParticipate";
import EditAddress from "../../EditAddress/EditAddress";
import Like from "../../Like/Like";
import PurchaseHistory from "../../PurchaseHistory/PurchaseHistory";
import RefundHistory from "../../RefundHistory/RefundHistory";
import ReportHistory from "../../ReportHistory/ReportHistory";
import ReportManagement from "../../ReportManagement/ReportManagement";
import Review from "../../Review/Review";
import SellerRegistration from "../../SellerRegistration/SellerRegistration";
import AnnouncementBoard from "../Announcement/AnnouncementBoard/AnnouncementBoard";
import CommissionFormManagement from "../MyForm/CommissionFormManagement/CommissionFormManagement";
import DemandFormManagement from "../MyForm/DemandFormManagement/DemandFormManagement";
import SaleFormManagement from "../MyForm/SaleFormManagement/SaleFormManagement";
import TradeFormManagement from "../MyForm/TradeFormManagement/TradeFormManagement";
import CommunityFormSection from "../MyPageSection/CommunityFormSection/CommunityFormSection";
import MyInformation from "../MyPageSection/MyInformation/MyInformation";
import "./MyPage.css";

function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activePage, setActivePage] = useState(null);
    const [editingAddress, setEditingAddress] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const sectionRef = useRef(null);
    
    // 공유할 문의 및 답변 상태를 MyPage에서 관리
    const [inquiries, setInquiries] = useState([
        { 
            id: 1, 
            title: "배송 관련 문의", 
            date: "2025-03-18", 
            hasReply: true, 
            content: "배송이 언제 되나요?", 
            replyContent: "배송은 2-3일 이내에 도착합니다.", 
            questioner: "사용자1", 
            status: "답변완료" 
        },
        { 
            id: 2, 
            title: "환불 가능 여부", 
            date: "2025-03-17", 
            hasReply: false, 
            content: "환불 가능한가요?", 
            questioner: "사용자2", 
            status: "답변하기" 
        }
    ]);

    // 윈도우 크기 상태 관리
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 768) {
                setMenuOpen(true);
            } else {
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 초기 로드 시 실행

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = queryParams.get("page");
        if (page) {
            setActivePage(page);
        }
    }, [location.search]);

    const handlePageClick = (page) => {
        setActivePage(page);
        navigate(`?page=${page}`);
        // 모바일에서 선택 후 메뉴 닫기
        if (windowWidth <= 768) {
            setMenuOpen(false);
        }
        
        // 섹션으로 스크롤
        setTimeout(() => {
            if (sectionRef.current) {
                sectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100); // 약간의 딜레이를 주어 렌더링 완료 후 스크롤
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // 문의 추가 함수
    const handleNewInquiry = (newTitle, newContent) => {
        const newInquiry = {
            id: inquiries.length + 1,
            title: newTitle,
            date: new Date().toISOString().split('T')[0],
            hasReply: false,
            content: newContent,
            questioner: "현재 사용자",
            status: "답변하기"
        };
        setInquiries((prevInquiries) => [...prevInquiries, newInquiry]);
    };

    // 문의 수정 함수
    const handleUpdateInquiry = (id, newTitle, newContent) => {
        setInquiries((prevInquiries) =>
            prevInquiries.map((inquiry) =>
                inquiry.id === id ? { ...inquiry, title: newTitle, content: newContent } : inquiry
            )
        );
    };

    // 문의 삭제 함수
    const handleDeleteInquiry = (id) => {
        setInquiries((prevInquiries) => prevInquiries.filter((inquiry) => inquiry.id !== id));
    };

    // 답변 저장 함수
    const handleSaveReply = (id, replyContent) => {
        setInquiries(prevInquiries =>
            prevInquiries.map(inquiry =>
                inquiry.id === id ? {
                    ...inquiry,
                    replyContent: replyContent,
                    status: "답변완료",
                    hasReply: true
                } : inquiry
            )
        );
    };

    // 신고 데이터 상태 추가
    const [reports, setReports] = useState([
        { 
            id: 1, 
            title: "첫 번째 신고", 
            content: "이 상품에 문제가 있습니다.",
            salePost: "판매글 제목 1",
            status: "접수 완료", 
            date: "2025-01-21",
            reporter: "현재 사용자",
            accused: "판매자1"
        },
        { 
            id: 2, 
            title: "두 번째 신고", 
            content: "사기 의심이 됩니다.",
            salePost: "판매글 제목 2",
            status: "처리 중", 
            date: "2025-01-22",
            reporter: "현재 사용자",
            accused: "판매자2"
        },
    ]);

    // 신고 추가 함수
    const handleNewReport = (newReport) => {
        setReports(prev => [...prev, {
            ...newReport,
            id: Math.max(...prev.map(r => r.id), 0) + 1,
            reporter: "현재 사용자",
            accused: "판매자",
            status: "접수 완료"
        }]);
    };

    // 신고 수정 함수
    const handleUpdateReport = (updatedReport) => {
        setReports(prev => 
            prev.map(r => r.id === updatedReport.id ? updatedReport : r)
        );
    };

    // 신고 삭제 함수
    const handleDeleteReport = (id) => {
        setReports(prev => prev.filter(r => r.id !== id));
    };

    // 신고 상태 업데이트 함수 (관리자용)
    const handleUpdateReportStatus = (id, newStatus, decision) => {
        setReports(prev =>
            prev.map(r =>
                r.id === id ? {
                    ...r,
                    status: newStatus,
                    decision: decision
                } : r
            )
        );
    };

    return (
        <div className="myPage-container">
            <div className="mypage-wrapper">
                {/* Mobile menu toggle button */}
                {windowWidth <= 768 && (
                    <button className="menu-toggle" onClick={toggleMenu}>
                        {menuOpen ? "▲ 메뉴 닫기" : "▼ 메뉴 열기"}
                    </button>
                )}

                {/* Left Bar */}
                <div className={`left-bar ${menuOpen ? 'open' : ''}`}>
                    <h2>MY 페이지</h2>
                    <ul>
                        <li 
                            onClick={() => handlePageClick("myInformation")}
                            className={activePage === "myInformation" ? "active" : ""}
                        >
                            내 정보
                        </li>
                        <li 
                            onClick={() => handlePageClick("community")}
                            className={activePage === "community" ? "active" : ""}
                        >
                            커뮤니티
                        </li>
                        <li 
                            onClick={() => handlePageClick("likes")}
                            className={activePage === "likes" ? "active" : ""}
                        >
                            좋아요
                        </li>
                        <li 
                            onClick={() => handlePageClick("reviews")}
                            className={activePage === "reviews" ? "active" : ""}
                        >
                            리뷰
                        </li>
                        <li 
                            onClick={() => handlePageClick("safeSeller")}
                            className={activePage === "safeSeller" ? "active" : ""}
                        >
                            안심 판매자 등록
                        </li>
                        <li 
                            onClick={() => handlePageClick("blockList")}
                            className={activePage === "blockList" ? "active" : ""}
                        >
                            차단 목록
                        </li>
                    </ul>
                    <h2>나의 폼</h2>
                    <ul>
                        <li
                            onClick={() => handlePageClick("saleFormManagement")}
                            className={activePage === "saleFormManagement" ? "active" : ""}
                        >
                            판매 폼 관리
                        </li>
                        <li
                            onClick={() => handlePageClick("commissionFormManagement")}
                            className={activePage === "commissionFormManagement" ? "active" : ""}
                        >
                            커미션 폼 관리
                        </li>
                        <li
                            onClick={() => handlePageClick("tradeFormManagement")}
                            className={activePage === "tradeFormManagement" ? "active" : ""}
                        >
                            중고거래 폼 관리
                        </li>
                        <li
                            onClick={() => handlePageClick("demandFormManagement")}
                            className={activePage === "demandFormManagement" ? "active" : ""}
                        >
                            수요조사 폼 관리
                        </li>
                        <li
                            onClick={() => handlePageClick("communityFormManagement")}
                            className={activePage === "communityFormManagement" ? "active" : ""}
                        >
                            커뮤니티 폼 관리</li>
                    </ul>
                    <h2>구매</h2>
                    <ul>
                        <li
                            onClick={() => handlePageClick("purchaseHistory")}
                            className={activePage === "purchaseHistory" ? "active" : ""}
                        >
                            구매 내역
                        </li>
                        <li
                            onClick={() => handlePageClick("refundHistory")}
                            className={activePage === "refundHistory" ? "active" : ""}
                        >
                            환불 내역
                        </li>
                        <li 
                            onClick={() => handlePageClick("demandParticipate")}
                            className={activePage === "demandParticipate" ? "active" : ""}
                        >
                            수요 조사 참여
                        </li>
                    </ul>
                    <h2>판매</h2>
                    <ul>
                        <li 
                            onClick={() => handlePageClick("salesHistory")}
                            className={activePage === "salesHistory" ? "active" : ""}
                        >
                            판매 내역
                        </li>
                        <li 
                            onClick={() => handlePageClick("salesManagement")}
                            className={activePage === "salesManagement" ? "active" : ""}
                        >
                            판매 관리
                        </li>
                        <li 
                            onClick={() => handlePageClick("adminDemandManage")}
                            className={activePage === "adminDemandManage" ? "active" : ""}
                        >
                            수요 조사 관리
                        </li>
                    </ul>
                    <h2>고객 센터</h2>
                    <ul>
                        <li 
                            onClick={() => handlePageClick("customerService")}
                            className={activePage === "customerService" ? "active" : ""}
                        >
                            문의
                        </li>
                        <li 
                            onClick={() => handlePageClick("report")}
                            className={activePage === "report" ? "active" : ""}
                        >
                            신고
                        </li>
                        <li 
                            onClick={() => handlePageClick("notice")}
                            className={activePage === "notice" ? "active" : ""}
                        >
                            공지사항
                        </li>
                    </ul>
                    <h2>관리자</h2>
                    <ul>
                        <li 
                            onClick={() => handlePageClick("customerServiceReply")}
                            className={activePage === "customerServiceReply" ? "active" : ""}
                        >
                            문의 답변
                        </li>
                        <li 
                            onClick={() => handlePageClick("reportManagement")}
                            className={activePage === "reportManagement" ? "active" : ""}
                        >
                            신고 관리
                        </li>
                        <li 
                            onClick={() => handlePageClick("notice")}
                            className={activePage === "notice" ? "active" : ""}
                        >
                            공지사항
                        </li>
                    </ul>
                </div>

                {/* Right Section */}
                <div className="myPage-section" ref={sectionRef}>
                    {activePage === "myInformation" && !editingAddress ? (
                        <MyInformation setEditingAddress={setEditingAddress} />
                    ) : editingAddress ? (
                        <EditAddress setEditingAddress={setEditingAddress} />
                    ) : activePage === "community" ? (
                        <CommunityFormSection />
                    ) : activePage === "saleFormManagement" ? (
                        <SaleFormManagement />
                    ) : activePage === "commissionFormManagement" ? (
                        <CommissionFormManagement />
                    ) : activePage === "tradeFormManagement" ? (
                        <TradeFormManagement />
                    ) : activePage === "demandFormManagement" ? (
                        <DemandFormManagement />
                    ) : activePage === "communityFormManagement" ? (
                        <CommunityFormSection />
                    ) : activePage === "purchaseHistory" ? (
                        <PurchaseHistory />
                    ) : activePage === "blockList" ? (
                        <BlockedList />
                    ) : activePage === "reviews" ? (
                        <Review />
                    ) : activePage === "safeSeller" ? (
                        <SellerRegistration />
                    ) : activePage === "refundHistory" ? (
                        <RefundHistory />
                    ) : activePage === "adminDemandManage" ? (
                        <AdminDemandManage />
                    ) : activePage === "demandParticipate" ? (
                        <DemandParticipate />
                    ) : activePage === "customerService" ? (
                        <CustomerService 
                            inquiries={inquiries}
                            handleNewInquiry={handleNewInquiry}
                            handleUpdateInquiry={handleUpdateInquiry}
                            handleDeleteInquiry={handleDeleteInquiry}
                            handleSaveReply={handleSaveReply}
                        />
                    ) : activePage === "report" ? (
                        <ReportHistory 
                            reports={reports.filter(r => r.reporter === "현재 사용자")}
                            onNewReport={handleNewReport}
                            onUpdateReport={handleUpdateReport}
                            onDeleteReport={handleDeleteReport}
                        />
                    ) : activePage === "reportManagement" ? (
                        <ReportManagement 
                            reports={reports}
                            onUpdateReportStatus={handleUpdateReportStatus}
                        />
                    ) : activePage === "customerServiceReply" ? (
                        <CustomerServiceReply 
                            inquiries={inquiries}
                            handleSaveReply={handleSaveReply}
                        />
                    ) : activePage === "likes" ? (
                        <Like />
                    ) : activePage === "notice" ? (
                        <AnnouncementBoard />
                    ) : (
                        <div className="background">
                            <img src={backgroundImg} alt="backgroundImg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyPage;