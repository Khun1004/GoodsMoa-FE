import React, { useState } from 'react';
import QuestionWrite from '../QuestionWrite/QuestionWrite';
import './CustomerService.css';

const CustomerService = ({ 
    inquiries, 
    handleNewInquiry, 
    handleUpdateInquiry,
    handleSaveReply
}) => {
    const [isQuestion, setIsQuestion] = useState(false);
    const [editInquiry, setEditInquiry] = useState(null);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [checkReplyVisible, setCheckReplyVisible] = useState(false);
    const [confirmedReplies, setConfirmedReplies] = useState([]);

    const handleQuestion = () => {
        setIsQuestion(true);
        setEditInquiry(null);
    };

    const handleEditInquiry = (inquiry) => {
        setEditInquiry(inquiry);
        setIsQuestion(true);
    };

    const handleDeleteInquiry = (id) => {
        setInquiries((prevInquiries) => prevInquiries.filter((inquiry) => inquiry.id !== id));
    };

    const handleTitleClick = (inquiry) => {
        setSelectedInquiry(inquiry);
    };

    const handleReplyClick = (inquiry) => {
        setCheckReplyVisible(true);
        setSelectedInquiry(inquiry);
    };

    const handleConfirmReply = (inquiryId) => {
        setConfirmedReplies((prev) => [...prev, inquiryId]);
        setCheckReplyVisible(false);
        setSelectedInquiry(null);
    };

    return (
        <div className="inquiry-container">
            {checkReplyVisible && selectedInquiry && (
                <div>
                    <h2>제목 : {selectedInquiry.title}</h2>
                    <p>내용 : {selectedInquiry.content}</p>
                    {selectedInquiry.hasReply && <p>답변: {selectedInquiry.replyContent}</p>}
                    <button className='backCustomerService' onClick={() => setCheckReplyVisible(false)}>뒤로 가기</button>
                </div>
            )}
            {!checkReplyVisible && (selectedInquiry ? (
                <div>
                    <h2>제목 : {selectedInquiry.title}</h2>
                    <p>내용 : {selectedInquiry.content}</p>
                    {selectedInquiry.hasReply && <p>답변: {selectedInquiry.replyContent}</p>}
                    <button className='backCustomerService' onClick={() => setSelectedInquiry(null)}>뒤로 가기</button>
                </div>
            ) : isQuestion ? (
                <QuestionWrite
                    setIsQuestion={setIsQuestion}
                    handleNewInquiry={handleNewInquiry}
                    handleUpdateInquiry={handleUpdateInquiry}
                    inquiryToEdit={editInquiry}
                />
            ) : (
                <div>
                    <div className="inquiry-header">
                        <h1 className="inquiry-title">문의 하기</h1>
                        <button className="inquiry-btn" onClick={handleQuestion}>
                            문의하기
                        </button>
                    </div>

                    <table className="inquiry-table">
                        <thead>
                            <tr>
                                <th>제목</th>
                                <th>질문 날짜</th>
                                <th></th>
                                <th>답장</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.id}>
                                    <td onClick={() => handleTitleClick(inquiry)} style={{cursor: 'pointer'}}>
                                        {inquiry.title}
                                    </td>
                                    <td>{inquiry.date}</td>
                                    <td className="edit-delete-btn">
                                        <button onClick={() => handleEditInquiry(inquiry)}>수정하기</button>
                                        <button onClick={() => handleDeleteInquiry(inquiry.id)}>삭제하기</button>
                                    </td>
                                    <td>
                                        <div className="reply-container">
                                            <button
                                                className={`inquiry-reply ${confirmedReplies.includes(inquiry.id) ? 'red-background' : ''}`}
                                                onClick={() => handleReplyClick(inquiry)}
                                            >
                                                답변
                                            </button>
                                            <div className={`reply-circle ${inquiry.hasReply ? 'reply-yes' : 'reply-no'}`}>
                                                {inquiry.hasReply ? '1' : 'X'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="question-info">
                        <h2 className="questions">자주 묻는 질문</h2>
                        <div className="faq-section">
                            <div className="faq-item">
                                <strong>Q1 : </strong> 결제는 어떻게 하나요?
                            </div>
                            <div className="faq-item">
                                <strong>Q2 : </strong> 환불이 가능한가요?
                            </div>
                            <div className="faq-item">
                                <strong>Q3 : </strong> 배송 조회는 어떻게 하나요?
                            </div>
                        </div>

                        <div className="delivery-info">
                            <p>구매 내역 메뉴에서 배송진행 상황을 확인할 수 있습니다.</p>
                            <p className='info-main'>MY페이지 → 구매 내역 → 배송 조회</p>
                            <p>지역에 따라 2~3일 정도 오차가 생길 수 있습니다.</p>
                            <p>상품 준비 중(상품 포장 및 확인) 단계부터는 주소 변경이 불가합니다.</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CustomerService;