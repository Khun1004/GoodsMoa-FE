import React, { useEffect, useRef, useState, useContext } from "react";
import { CiImageOn } from "react-icons/ci";
import {
  FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaBold,
  FaCaretDown, FaItalic, FaPaintBrush, FaStrikethrough, FaUnderline
} from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { LuRedo2, LuUndo2 } from "react-icons/lu";
import { PiListBulletsBold } from "react-icons/pi";
import { RiFontSize } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import "./TradeWrite.css";


const TradeWrite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const initialFormState = location.state?.formTradeData || {};
  const isEditMode = location.state?.isEditMode === true;

  // ## 핵심 수정 1: 이미지 상태 관리 변경 ##
  // 이제 이미지를 { id, file } 형태의 객체로 관리합니다.
  const [contentImageObjects, setContentImageObjects] = useState(initialFormState.contentImageObjects || []);
  const [color, setColor] = useState("#000000");
  const [savedSelection, setSavedSelection] = useState(null);

  // ## 핵심 수정 2: 에디터 로드 시 이미지 주소 새로 발급 ##
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // 1. 기존 HTML 내용을 에디터에 설정합니다.
    editor.innerHTML = initialFormState.content || "";

    // 2. HTML 내의 모든 이미지 태그를 찾습니다.
    const imagesInEditor = editor.querySelectorAll("img[data-id]");
    
    // 3. 이미지 태그를 순회하며 새 임시 주소를 발급하고 교체합니다.
    imagesInEditor.forEach(imgElement => {
      const imgId = imgElement.dataset.id;
      const matchingImageObject = (initialFormState.contentImageObjects || []).find(obj => obj.id === imgId);

      if (matchingImageObject) {
        // 실제 파일(File) 객체로부터 새 Blob URL을 생성합니다.
        const newSrc = URL.createObjectURL(matchingImageObject.file);
        imgElement.src = newSrc;
      } else {
        // 짝을 찾지 못한 이미지는 깨진 이미지로 표시될 수 있으므로 제거하거나 다른 처리를 할 수 있습니다.
        imgElement.style.border = "2px solid red"; // 예: 에러 표시
      }
    });
  }, []); // 이 로직은 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.
  
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0));
    }
  };

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // ## 핵심 수정 3: 이미지 업로드 로직 변경 ##
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    let range = savedSelection;
    if (!range && editorRef.current) { // 커서 위치가 없으면 에디터 끝을 선택
        editorRef.current.focus();
        const selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    if (!range) return alert("이미지를 삽입할 위치를 에디터 안에서 클릭해주세요.");

    files.forEach((file) => {
      // 이미지마다 고유 ID를 부여합니다.
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newImageObject = { id, file };
      
      setContentImageObjects(prev => [...prev, newImageObject]);

      const previewUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = previewUrl;
      img.alt = file.name;
      img.style.maxWidth = "100%";
      // HTML 태그에 고유 ID를 데이터 속성으로 저장합니다.
      img.dataset.id = id;

      range.insertNode(img);
      range.setStartAfter(img);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    });
  };

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);
    handleCommand("foreColor", selectedColor);
  };

  // ## 핵심 수정 4: 저장 로직 변경 ##
  const handleSave = () => {
    const finalHtmlContent = editorRef.current.innerHTML;

    navigate("/tradeForm", {
      state: {
        isEditMode: isEditMode,
        formTradeData: {
          ...initialFormState,
          content: finalHtmlContent,
          // 파일과 ID가 함께 있는 객체 배열을 그대로 전달합니다.
          contentImageObjects: contentImageObjects,
        },
      },
    });
  };

  return (
    <div className="container">
      <div className="sale-write-container">
        <header className="sale-write-header">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            <IoIosArrowBack />
          </button>
          <h2 className="title">본문</h2>
          <button type="button" className="save-button" onClick={handleSave}>저장</button>
        </header>

        <div className="toolbar">
          <label htmlFor="imageUpload" className="CiImageOn" style={{ cursor: "pointer" }}>
            <CiImageOn />
          </label>
          <input type="file" id="imageUpload" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageUpload} />
          <button onClick={() => handleCommand("undo")}><LuUndo2 /></button>
          <button onClick={() => handleCommand("redo")}><LuRedo2 /></button>
        </div>

        <div className="editor-toolbar">
          <button onClick={() => handleCommand("bold")}><FaBold /></button>
          <button onClick={() => handleCommand("italic")}><FaItalic /></button>
          <button onClick={() => handleCommand("underline")}><FaUnderline /></button>
          <button onClick={() => handleCommand("strikeThrough")}><FaStrikethrough /></button>
          <button onClick={() => handleCommand("justifyLeft")}><FaAlignLeft /></button>
          <button onClick={() => handleCommand("justifyCenter")}><FaAlignCenter /></button>
          <button onClick={() => handleCommand("justifyRight")}><FaAlignRight /></button>
          <button onClick={() => handleCommand("justifyFull")}><FaAlignJustify /></button>
          <select onChange={(e) => handleCommand("fontSize", e.target.value)} defaultValue="3">
              {[1,2,3,4,5,6,7].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
          <button onClick={() => handleCommand("insertUnorderedList")}><PiListBulletsBold /></button>
          <label className="color-picker-label">
            <FaPaintBrush />
            <input type="color" value={color} onChange={handleColorChange} />
          </label>
        </div>

        <div
          ref={editorRef}
          className="editor"
          contentEditable
          suppressContentEditableWarning
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onFocus={saveSelection}
        />
      </div>
    </div>
  );
};

export default TradeWrite;