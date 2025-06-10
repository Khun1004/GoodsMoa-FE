import React, { useEffect, useState } from "react";
import "./ReplyWrite.css";

const ReplyWrite = ({ inquiry, onSaveReply, isEdit, onCancel }) => {
    const [replyContent, setReplyContent] = useState("");

    useEffect(() => {
        setReplyContent(inquiry.replyContent || "");
    }, [inquiry]);

    const handleReplyChange = (e) => {
        setReplyContent(e.target.value);
    };

    const handleSaveReply = () => {
        if (replyContent.trim()) {
            onSaveReply(inquiry.id, replyContent);
            onCancel && onCancel();
        }
    };

    return (
        <div className="reply-write-container">
            <h2>{isEdit ? "답변 수정" : "답변 등록"}</h2>
            <div className="inquiry-info">
                <div><strong>문의 제목:</strong> {inquiry.title}</div>
                <div><strong>문의 내용:</strong> {inquiry.content}</div>
            </div>

            <div className="reply-section">
                <h3>답변 내용:</h3>
                <textarea
                    value={replyContent}
                    onChange={handleReplyChange}
                    placeholder="답변을 작성해주세요."
                ></textarea>
            </div>

            <div className="reply-buttons">
                <button className="save-reply-btn" onClick={handleSaveReply}>
                    {isEdit ? "답변 수정" : "답변 등록"}
                </button>
                <button className="cancel-reply-btn" onClick={onCancel}>
                    취소
                </button>
            </div>
        </div>
    );
};

export default ReplyWrite;