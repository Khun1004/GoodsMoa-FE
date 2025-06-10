import React, { useEffect, useRef, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaBold, FaCaretDown, FaItalic, FaPaintBrush, FaStrikethrough, FaUnderline } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { LuRedo2, LuUndo2 } from "react-icons/lu";
import { PiListBulletsBold } from "react-icons/pi";
import { RiFontSize } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import "./CommissionWrite.css";

const CommissionWrite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editorRef = useRef(null);
    const [content, setContent] = useState("");
    const [color, setColor] = useState("#000000");

    useEffect(() => {
        if (editorRef.current) {
            if (location.state?.description) {
                editorRef.current.innerHTML = location.state.description;
                setContent(location.state.description);
            } else {
                editorRef.current.innerHTML = "";
                setContent("");
            }
        }
    }, [location.state?.description]);

    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const image = `<img src="${e.target.result}" alt="Uploaded Image" />`;
                const editor = editorRef.current;
                editor.focus();
                document.execCommand("insertHTML", false, image);
                setContent(editor.innerHTML);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleColorChange = (event) => {
        const selectedColor = event.target.value;
        setColor(selectedColor);
        document.execCommand("foreColor", false, selectedColor);
    };

    const handleSave = () => {
        const description = editorRef.current.innerHTML;
        navigate("/commissionForm", {
            state: {
                ...location.state, // 기존 데이터 유지
                description,       // 본문만 업데이트
            }
        });
    };    

    return (
        <div className="container">
            <div className="sale-write-container">
                <header className="sale-write-header">
                    <button 
                        type="button"
                        className="back-button" 
                        onClick={() => navigate(-1)}
                    >
                        <IoIosArrowBack />
                    </button>
                    <h2 className="title">본문</h2>
                    <button 
                        type="button"
                        className="save-button" 
                        onClick={handleSave}
                    >
                        저장
                    </button>
                </header>

                {/* 상단 툴바 */}
                <div className="toolbar">
                    <button onClick={() => alert("추가 기능 준비 중!")}>+</button>
                    
                    <label htmlFor="imageUpload" 
                        className="CiImageOn"
                        style={{ cursor: "pointer" }}>
                        <CiImageOn />
                    </label>
                    <input 
                        type="file" 
                        id="imageUpload" 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        onChange={handleImageUpload} 
                    />

                    <button onClick={() => handleCommand("undo")}>
                        <LuUndo2 />
                    </button>
                    <button onClick={() => handleCommand("redo")}>
                        <LuRedo2 />
                    </button>
                </div>

                {/* 텍스트 편집 툴바 */}
                <div className="editor-toolbar">
                    <button onClick={() => handleCommand("bold")}>
                        <b><FaBold /></b>
                    </button>
                    <button onClick={() => handleCommand("italic")}>
                        <i><FaItalic /></i>
                    </button>
                    <button onClick={() => handleCommand("underline")}>
                        <FaUnderline />
                    </button>
                    <button onClick={() => handleCommand("strikeThrough")}>
                        <FaStrikethrough />
                    </button>
                    <button onClick={() => handleCommand("justify")}>
                        <FaAlignJustify />
                    </button>
                    <button onClick={() => handleCommand("justifyLeft")}>
                        <FaAlignLeft />
                    </button>
                    <button onClick={() => handleCommand("justifyCenter")}>
                        <FaAlignCenter />
                    </button>
                    <button onClick={() => handleCommand("justifyRight")}>
                        <FaAlignRight />
                    </button>
                    <button onClick={() => handleCommand("fontSize", "5")}>
                        <RiFontSize />
                    </button>
                    <button onClick={() => handleCommand("fontSize", "2")}>
                        <p>fontsize</p>
                        <FaCaretDown />
                    </button>
                    <button onClick={() => handleCommand("insertUnorderedList")}>
                        <PiListBulletsBold />
                    </button>
                    
                    {/* 색상 선택 버튼 */}
                    <button>
                        <FaPaintBrush />
                        <input
                            type="color"
                            value={color}
                            onChange={handleColorChange}
                            style={{ width: '30px', height: '30px', marginLeft: '10px', border: 'none', padding: 0 }}
                        />
                    </button>
                </div>

                {/* 본문 에디터 */}
                <div
                    ref={editorRef}
                    className="editor"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                >
                </div>
            </div>
        </div>
    );
};

export default CommissionWrite;