import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useLocation } from "react-router-dom";

const DemandWrite = () => {
    const quillRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    // 폼에서 받아온 내용(수정 or 등록) 초기화
    const [content, setContent] = useState(location.state?.description ?? "");
    const [descriptionImages, setDescriptionImages] = useState(location.state?.descriptionImages ?? []);

    // location.state가 바뀌면 동기화 (뒤로가기 등 대응)
    useEffect(() => {
        if (location.state?.description !== undefined) {
            setContent(location.state.description);
        }
        if (location.state?.descriptionImages !== undefined) {
            setDescriptionImages(location.state.descriptionImages);
        }
    }, [location.state]);

    // 저장 시 demandForm으로 전체 정보 전달 (수정/등록 모두)
    const handleSave = () => {
        navigate("/demandform", {
            state: {
                ...location.state,
                description: content,
                descriptionImages,
            },
        });
    };

    // 이미지 첨부 핸들러
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 이미지 배열에 저장
        setDescriptionImages(prev => [...prev, file]);

        // quill 에디터에 이미지 미리보기 추가
        const reader = new FileReader();
        reader.onload = (event) => {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range ? range.index : 0, "image", event.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
            <h2>상세설명 작성</h2>
            <ReactQuill
                ref={quillRef}
                value={content}
                onChange={setContent}
                style={{ height: 320, marginBottom: 32 }}
                placeholder="상세설명을 입력하세요..."
            />
            <div style={{ marginBottom: 24 }}>
                <label>이미지 넣기: </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={handleSave}>저장</button>
                <button type="button" onClick={() => navigate(-1)}>취소</button>
            </div>
        </div>
    );
};

export default DemandWrite;
