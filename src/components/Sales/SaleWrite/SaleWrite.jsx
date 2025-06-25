import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProductService from "../../../api/ProductService";
import "./SaleWrite.css";

const API_BASE_URL = 'http://localhost:8080';

const SaleWrite = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [content, setContent] = useState(location.state?.description || "");
    const [images, setImages] = useState(location.state?.contentImages || []);
    const [postId, setPostId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const quillRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for hidden file input

    useEffect(() => {
        console.log("SaleWrite location.state:", location.state);

        if (location.state?.description) {
            setContent(location.state.description);
        }
        if (location.state?.contentImages) {
            setImages(location.state.contentImages);
        }
        if (location.state?.postId) {
            setPostId(String(location.state.postId));
        }

        // Initialize custom image handler for ReactQuill
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const toolbar = quill.getModule("toolbar");
            toolbar.addHandler("image", () => {
                // Trigger the hidden file input click
                fileInputRef.current?.click();
            });
        }
    }, [location.state]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // File size limit check (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);

        if (oversizedFiles.length > 0) {
            setError(`Some files are too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
            return;
        }

        setLoading(true);
        try {
            const currentPostId = postId && !String(postId).startsWith('temp_')
                ? postId
                : `temp_${Date.now()}`;

            // Find the highest index among existing images
            const maxIndex = images.reduce((max, img) => {
                const match = img.url.match(/_(\d+)\./);
                return match ? Math.max(max, parseInt(match[1], 10)) : max;
            }, 0);

            const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
            const uploadPromises = [];

            // Upload images in batches of 3
            const batchSize = 3;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                uploadPromises.push(
                    ...batch.map(async (file, index) => {
                        try {
                            const fileObj = await ProductService.processImageForUpload({ file });
                            if (!fileObj?.file) return null;

                            const extension = validExtensions.includes(fileObj.extension?.toLowerCase())
                                ? fileObj.extension.toLowerCase()
                                : 'jpg';

                            const imageIndex = maxIndex + i + index + 1;
                            const imageUrl = `${API_BASE_URL}/productPost/content/${currentPostId}_${imageIndex}.${extension}`;

                            return {
                                file: fileObj.file,
                                extension,
                                preview: URL.createObjectURL(fileObj.file),
                                url: imageUrl,
                                isTemporary: String(currentPostId).startsWith('temp_'),
                            };
                        } catch (err) {
                            console.error(`Failed to process image ${file.name}:`, err);
                            return null;
                        }
                    })
                );
            }

            const newImages = (await Promise.all(uploadPromises)).filter(img => img !== null);
            setImages(prev => [...prev, ...newImages]);

            if (quillRef.current && newImages.length > 0) {
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true) || { index: quill.getLength() };
                newImages.forEach(img => {
                    quill.insertEmbed(range.index, "image", img.url);
                    range.index += 1;
                });
                setContent(quill.root.innerHTML);
            }
        } catch (err) {
            setError(`Image upload failed: ${err.message}`);
        } finally {
            setLoading(false);
            // Clear the file input to allow re-uploading the same file
            if (e.target) e.target.value = '';
        }
    };

    const handleSubmit = () => {
        const updatedContent = content || "";
        navigate("/saleForm", {
            state: {
                ...location.state,
                description: updatedContent,
                contentImages: images,
                postId: postId,
                from: "write",
                isEditMode: location.state?.isEditMode || false,
            },
        });
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'align',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ];

    return (
        <div className="sale-write-wrapper">
            <div className="sale-write-container">
                <h1 className="sale-write-title">상품 상세 설명 작성</h1>

                {loading && (
                    <div className="sale-write-loading">
                        <div className="spinner"></div>
                        <span>Uploading images...</span>
                    </div>
                )}

                {error && (
                    <div className="sale-write-error">
                        <span className="error-icon">!</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="editor-container">
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder="상품에 대한 상세한 설명을 입력해주세요..."
                        className="sale-write-editor"
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
                            ref={fileInputRef} // Use the same file input for both
                        />
                        <span className="saleWriteUpload-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            이미지 추가
                        </span>
                    </label>

                    <div className="saleWriteImage-preview-container">
                        {images.map((img, index) => (
                            <div key={index} className="saleWriteImage-preview-item">
                                <img src={img.preview} alt={`업로드 이미지 ${index + 1}`} />
                                <button
                                    className="delete-image-button"
                                    onClick={() => {
                                        setImages(images.filter((_, i) => i !== index));

                                        const newContent = content.replace(
                                            new RegExp(`<img[^>]+src=["']${img.url}["'][^>]*>`, 'g'),
                                            ''
                                        );

                                        setContent(newContent);
                                    }}
                                    aria-label="Delete image"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="saleWriteBtn-group">
                    <button
                        className="saleWriteSubmitBtn"
                        onClick={handleSubmit}
                    >
                        작성 완료
                    </button>
                    <button
                        className="saleWriteCancelBtn"
                        onClick={() => navigate("/saleForm", { state: { ...location.state, from: "write" } })}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleWrite;