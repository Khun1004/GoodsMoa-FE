import React, { useState } from 'react';
import './AnnouncementForm.css';

const AnnouncementForm = ({ onAddAnnouncement, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        
        const newAnnouncement = {
            id: Date.now(),
            title,
            content,
            date: new Date().toISOString().split('T')[0],
            isImportant
        };
        
        onAddAnnouncement(newAnnouncement);
        setTitle('');
        setContent('');
        setIsImportant(false);
    };
    
    return (
        <div className="announcement-form-container">
            <div className="announcement-form">
                <h3>새 공지사항 등록</h3>
                <form onSubmit={handleSubmit}>
                    <div className="AnnForm-group">
                        <label>제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="AnnForm-group">
                        <label>내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="AnnForm-group AnnFormcheckbox-group">
                        <input
                            type="checkbox"
                            id="important"
                            checked={isImportant}
                            onChange={(e) => setIsImportant(e.target.checked)}
                        />
                        <label htmlFor="important">중요 공지사항</label>
                    </div>
                    <div className="AnnFormBtns">
                        <button type="submit" className="AnnFormSumbitBtn">등록</button>
                        <button type="button" className="AnnFormCancelBtn" onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementForm;