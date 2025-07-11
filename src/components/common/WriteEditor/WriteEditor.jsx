import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProductService from "../../../api/ProductService";
import "./WriteEditor.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WriteEditor = ({ 
    type = "sale", // "sale", "trade", "demand", "commission"
    title = "상품 상세 설명 작성",
    placeholder = "상품에 대한 상세한 설명을 입력해주세요...",
    onSave,
    onCancel,
    initialContent = "",
    initialImages = [],
    postId = null,
    isEditMode = false
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [content, setContent] = useState(initialContent || location.state?.description || location.state?.content || "");
    const [images, setImages] = useState(initialImages || location.state?.contentImages || []);
    const [currentPostId, setCurrentPostId] = useState(postId || location.state?.postId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const quillRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploadedFiles, setUploadedFiles] = useState(new Map()); // base64 -> File 매핑

    useEffect(() => {
        console.log(`${type}Write location.state:`, location.state);
        console.log(`[WriteEditor] mount: initialContent=`, initialContent, 'initialImages=', initialImages, 'postId=', postId, 'isEditMode=', isEditMode);

        // 초기 데이터 설정
        if (location.state?.description) {
            setContent(location.state.description);
        }
        if (location.state?.content) {
            setContent(location.state.content);
        }
        if (location.state?.contentImages) {
            setImages(location.state.contentImages);
        }
        if (location.state?.postId) {
            setCurrentPostId(String(location.state.postId));
        }

        // ReactQuill 이미지 핸들러 base64로 강제 등록
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const toolbar = quill.getModule("toolbar");
            toolbar.addHandler("image", () => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.click();
                input.onchange = async () => {
                    const file = input.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64 = e.target.result;
                        const range = quill.getSelection(true) || { index: quill.getLength() };
                        quill.insertEmbed(range.index, "image", base64);
                        setContent(quill.root.innerHTML);
                        // base64와 File 객체 매핑 저장
                        setUploadedFiles(prev => new Map(prev).set(base64, file));
                    };
                    reader.readAsDataURL(file);
                };
            });
        }
    }, [location.state, type]);

    // 키보드 단축키 지원
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + S: 저장
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSubmit();
            }
            // Ctrl/Cmd + Enter: 저장
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
            // Escape: 취소
            if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 모달 외부 클릭 시 닫기
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    // base64로 에디터에 삽입하는 업로드 함수
    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;
        setLoading(true);
        try {
            for (const file of fileArray) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    if (quillRef.current) {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true) || { index: quill.getLength() };
                        quill.insertEmbed(range.index, "image", base64);
                        setContent(quill.root.innerHTML);
                        // base64와 File 객체 매핑 저장
                        setUploadedFiles(prev => new Map(prev).set(base64, file));
                        console.log(`[WriteEditor] 이미지 첨부: base64=`, base64.slice(0,30), 'file=', file);
                    }
                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            setError(`이미지 업로드 실패: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // base64 이미지를 File 객체로 변환하는 함수 (백엔드 API에 맞게 수정)
    const convertBase64ToFiles = (htmlContent) => {
        if (!htmlContent) return { content: htmlContent, files: [] };
        
        let convertedContent = htmlContent;
        const base64Regex = /data:image\/[^;]+;base64,[^"]+/g;
        const base64Matches = htmlContent.match(base64Regex) || [];
        const files = [];
        
        base64Matches.forEach((base64, index) => {
            const file = uploadedFiles.get(base64);
            if (file) {
                // base64를 임시 플레이스홀더로 대체 (서버에서 실제 URL로 교체됨)
                const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
                convertedContent = convertedContent.replace(base64, placeholder);
                files.push(file); // File 객체만 저장 (MultipartFile로 전송)
                console.log(`[WriteEditor] convertBase64ToFiles: base64→placeholder`, placeholder, file);
            }
        });
        
        console.log(`[WriteEditor] convertBase64ToFiles 결과:`, { convertedContent, files });
        return { content: convertedContent, files };
    };

    const handleSubmit = () => {
        const updatedContent = content || "";
        
        // base64 이미지를 File 객체로 변환
        const { content: processedContent, files: contentFiles } = convertBase64ToFiles(updatedContent);
        
        console.log(`[WriteEditor] handleSubmit: processedContent=`, processedContent, 'contentFiles=', contentFiles);
        if (onSave) {
            console.log(`[WriteEditor] onSave 호출:`, { processedContent, images: [...images, ...contentFiles], postId: currentPostId, isEditMode: isEditMode || location.state?.isEditMode || false });
            onSave({
                content: processedContent, // base64가 제거된 content
                images: [...images, ...contentFiles], // File 객체들 추가
                postId: currentPostId,
                isEditMode: isEditMode || location.state?.isEditMode || false,
            });
        } else {
            // 기본 네비게이션 로직
            const formRoutes = {
                sale: "/saleForm",
                trade: "/tradeForm", 
                demand: "/demandForm",
                commission: "/commissionForm"
            };
            
            const targetRoute = formRoutes[type];
            if (targetRoute) {
                // Trade의 경우 contentImageObjects 구조 지원
                const stateData = {
                    ...location.state,
                    description: processedContent, // base64가 제거된 content
                    content: processedContent,     // base64가 제거된 content
                    contentImages: [...images, ...contentFiles], // File 객체들 추가
                    postId: currentPostId,
                    from: "write",
                    isEditMode: isEditMode || location.state?.isEditMode || false,
                };

                // Trade의 경우 기존 formTradeData 구조 유지
                if (type === "trade" && location.state?.formTradeData) {
                    stateData.formTradeData = {
                        ...location.state.formTradeData,
                        content: processedContent, // base64가 제거된 content
                        contentImageObjects: [...images, ...contentFiles].map((img, index) => ({
                            id: `img-${Date.now()}-${index}`,
                            file: img.file || img
                        })),
                    };

                    stateData.formTradeData.contentImageObjects.forEach((imgObj, idx) => {
                        console.log(`[TradeForm] FormData append: contentImageObjects[${idx}]`, imgObj);
                        stateData.formTradeData.append(isEditMode ? "newContentImages" : "contentImages", imgObj.file);
                    });
                }

                navigate(targetRoute, { state: stateData });
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(-1);
        }
    };

    const handleFileInputChange = (e) => {
        handleImageUpload(e.target.files);
        e.target.value = ''; // 파일 입력 초기화
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        handleImageUpload(files);
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
        <div className="write-editor-wrapper" onClick={handleBackdropClick}>
            <div className="write-editor-container">
                <button 
                    className="write-editor-close-btn"
                    onClick={handleCancel}
                    aria-label="닫기"
                >
                    ×
                </button>
                <h1 className="write-editor-title">{title}</h1>

                {loading && (
                    <div className="write-editor-loading">
                        <div className="spinner"></div>
                        <span>이미지 업로드 중...</span>
                    </div>
                )}

                {error && (
                    <div className="write-editor-error">
                        <span className="error-icon">!</span>
                        <span>{error}</span>
                        <button 
                            className="error-close-btn"
                            onClick={() => setError(null)}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="editor-container">
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder={placeholder}
                        className="write-editor-quill"
                    />
                    {/* 숨겨진 파일 입력 (툴바 이미지 업로드용) */}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        ref={fileInputRef}
                        style={{ display: "none" }}
                    />
                </div>

                <div className="write-editor-btn-group">
                    <button
                        className="write-editor-submit-btn"
                        onClick={handleSubmit}
                    >
                        작성 완료
                    </button>
                    <button
                        className="write-editor-cancel-btn"
                        onClick={handleCancel}
                    >
                        취소
                    </button>
                </div>
                
                <div className="write-editor-shortcuts">
                    <small>
                        단축키: <kbd>Ctrl+S</kbd> 저장, <kbd>Esc</kbd> 취소
                    </small>
                </div>
            </div>
        </div>
    );
};

export default WriteEditor; 