// ✅ 수정된 CommissionWrite.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate } from "react-router-dom";
import "./CommissionWrite.css";

const CommissionWrite = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [content, setContent] = useState(location.state?.content || "");
    const [images, setImages] = useState(location.state?.contentImages || []);
    const quillRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const toolbar = quill.getModule("toolbar");
            toolbar.addHandler("image", () => {
                fileInputRef.current?.click();
            });
        }
    }, []);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map((file) => {
            const preview = URL.createObjectURL(file);
            const extension = file.name.split('.').pop().toLowerCase();
            const url = preview;
            return { file, preview, url, extension };
        });

        setImages((prev) => [...prev, ...newImages]);

        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true) || { index: quill.getLength() };
            newImages.forEach(img => {
                quill.insertEmbed(range.index, "image", img.url);
                range.index += 1;
            });
            setContent(quill.root.innerHTML);
        }

        e.target.value = "";
    };

    const handleSubmit = () => {
        navigate("/commissionForm", {
            state: {
                from: "write",                      // ✅ "write"로 수정
                id: location.state?.id || null,
                image: location.state?.image || null,
                title: location.state?.title || "",
                category: location.state?.category || "",
                maxCount: location.state?.maxCount || "",
                minPrice: location.state?.minPrice || "",
                maxPrice: location.state?.maxPrice || "",
                tags: location.state?.tags || [],
                applicationForms: location.state?.applicationForms || [{ title: "", reqContent: "" }],
                content,                             // ✅ 작성한 상세 설명 전달
                contentImages: images,
            },
        });
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'color', 'background', 'align', 'link', 'image'
    ];

    return (
        <div className="commission-write-wrapper">
            <div className="commission-write-container">
                <h1 className="commission-write-title">커미션 상세 설명 작성</h1>

                <div className="editor-container">
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder="커미션 상세 설명을 입력하세요..."
                        className="commission-write-editor"
                    />
                </div>

                <div className="image-upload-section">
                    <label className="image-upload-label">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="image-upload-input"
                            ref={fileInputRef}
                        />
                        <span className="commissionUpload-button">이미지 추가</span>
                    </label>

                    <div className="commissionImage-preview-container">
                        {images.map((img, idx) => (
                            <div key={idx} className="commissionImage-preview-item">
                                <img src={img.preview} alt={`업로드 이미지 ${idx + 1}`} />
                                <button
                                    className="delete-image-button"
                                    onClick={() => {
                                        setImages(images.filter((_, i) => i !== idx));
                                        setContent(prev =>
                                            prev.replace(
                                                new RegExp(`<img[^>]+src=["']${img.url}["'][^>]*>`, 'g'),
                                                ''
                                            )
                                        );
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="commissionBtn-group">
                    <button className="commissionSubmitBtn" onClick={handleSubmit}>작성 완료</button>
                    <button
                        className="commissionCancelBtn"
                        onClick={() => navigate(-1)}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommissionWrite;
