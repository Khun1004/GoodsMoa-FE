import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./DemandWrite.css";


// ... patchSrcToAbsolute, patchSrcToRelative 함수 생략 ...

const DemandWrite = ({ description, setDescription, descriptionImages, setDescriptionImages, onClose }) => {
    const quillRef = useRef();
    const [content, setContent] = useState(description || "");
    const [images, setImages] = useState(descriptionImages ?? []);

    useEffect(() => {
        setContent(description || "");
        setImages(descriptionImages ?? []);
    }, [description, descriptionImages]);

    const handleSave = () => {
        setDescription(content);
        setDescriptionImages(images);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImages(prev => [...prev, file]);
        const reader = new FileReader();
        reader.onload = (event) => {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range ? range.index : 0, "image", event.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="demandwrite-modal-backdrop">
            <div className="demandwrite-modal-content">
                <h2>상세설명 작성</h2>
                <ReactQuill
                    ref={quillRef}
                    value={content}
                    onChange={setContent}
                    className="demandwrite-quill"
                    placeholder="상세설명을 입력하세요..."
                />
                <div className="demandwrite-upload-box">
                    <label>이미지 넣기:</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="demandwrite-btn-group">
                    <button type="button" className="demandwrite-btn" onClick={handleSave}>저장</button>
                    <button type="button" className="demandwrite-btn cancel" onClick={handleCancel}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default DemandWrite;
