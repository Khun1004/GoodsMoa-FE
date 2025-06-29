// DemandWrite.jsx 수정된 구조 예시
import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./DemandWrite.css";

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const resizedFile = await resizeImage(file);
        setImages(prev => [...prev, resizedFile]);
        const reader = new FileReader();
        reader.onload = (event) => {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range ? range.index : 0, "image", event.target.result);
        };
        reader.readAsDataURL(resizedFile);
    };

    const resizeImage = (file, maxSize = 450) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;

                    if (width > height && width > maxSize) {
                        height = (maxSize / width) * height;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (maxSize / height) * width;
                        height = maxSize;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const resizedFile = new File([blob], file.name, { type: file.type });
                        resolve(resizedFile);
                    }, file.type, 0.9); // 압축 품질 조절 가능
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };


    return (
        <div className="demandwrite-wrapper">
            <div className="demandwrite-container">
                <h2 className="demandwrite-title">상세 설명 작성</h2>

                <div className="editor-container">
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={setContent}
                        className="demandwrite-editor"
                        placeholder="상세설명을 입력하세요..."
                    />
                </div>

                <div className="image-upload-section">
                    <label htmlFor="image-upload" className="saleWriteUpload-button">
                        + 이미지 추가
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="image-upload-input"
                    />
                </div>


                <div className="demandwrite-btn-group">
                    <button className="demandwrite-submit" onClick={handleSave}>저장</button>
                    <button className="demandwrite-cancel" onClick={handleCancel}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default DemandWrite;
