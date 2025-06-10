import React, { useState } from "react";
import ReplyWrite from "../ReplyWrite/ReplyWrite";
import "./CustomerServiceReply.css";

const CustomerServiceReply = ({ inquiries, handleSaveReply }) => {
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [checkReplyVisible, setCheckReplyVisible] = useState(false);

    const handleReplyButtonClick = (inquiry) => {
        setSelectedInquiry({
            ...inquiry,
            isEdit: false // 새 답변 작성 모드
        });
        setCheckReplyVisible(true);
    };
    
    const handleEditReply = (inquiry) => {
        setSelectedInquiry({
            ...inquiry,
            isEdit: true // 답변 수정 모드
        });
        setCheckReplyVisible(true);
    };

    return (
        <div className="inquiry-container">
            {checkReplyVisible && selectedInquiry ? (
                <ReplyWrite
                    inquiry={selectedInquiry}
                    onSaveReply={handleSaveReply}
                    isEdit={selectedInquiry.isEdit} // 명시적으로 isEdit 값 전달
                    onCancel={() => setCheckReplyVisible(false)}
                />
            ) : (
                <>
                    <h2 className="customerServiceReplyTitle">문의 답변 하기</h2>
                    <table className="customerServiceRe-table">
                        <thead>
                            <tr>
                                <th>제목</th>
                                <th>질문자</th>
                                <th>질문 날짜</th>
                                <th>답변</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inquiry, index) => (
                                <tr key={index}>
                                    <td>{inquiry.title}</td>
                                    <td>{inquiry.questioner}</td>
                                    <td>{inquiry.date}</td>
                                    <td>
                                        {inquiry.status === "답변하기" && (
                                            <button
                                                className="reploy-status-btn pending"
                                                onClick={() => handleReplyButtonClick(inquiry)}
                                            >
                                                답변하기
                                            </button>
                                        )}
                                        {inquiry.status === "답변완료" && (
                                            <div className="btn-container">
                                                <button className="reploy-status-btn completed">
                                                    {inquiry.status}
                                                </button>
                                                <button 
                                                    className="edit-reply-btn" 
                                                    onClick={() => handleEditReply(inquiry)}
                                                >
                                                    답변수정
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default CustomerServiceReply;