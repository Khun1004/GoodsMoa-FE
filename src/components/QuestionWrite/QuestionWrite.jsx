import React, { useEffect, useState } from 'react';
import './QuestionWrite.css';

const QuestionWrite = ({ setIsQuestion, handleNewInquiry, handleUpdateInquiry, inquiryToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (inquiryToEdit) {
            setTitle(inquiryToEdit.title);
            setContent(inquiryToEdit.content);
        }
    }, [inquiryToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inquiryToEdit) {
            handleUpdateInquiry(inquiryToEdit.id, title, content);
        } else {
            handleNewInquiry(title, content);
        }
        setIsQuestion(false); // 제출 후 문의 작성 창 닫기
    };

    return (
        <div className="question-write-container">
            <h2 className="writeQuestion">{inquiryToEdit ? '문의 수정' : '문의 작성'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>문의 내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>
                <div className="questionBtn">
                    <button type="submit">{inquiryToEdit ? '수정하기' : '등록하기'}</button>
                    <button type="button" onClick={() => setIsQuestion(false)}>취소하기</button>
                </div>
            </form>
        </div>
    );
};

export default QuestionWrite;