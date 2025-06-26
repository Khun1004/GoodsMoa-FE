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
import { useNavigate } from "react-router-dom";
import "./TradeWrite.css";
import { TradeContext } from "../../../contexts/TradeContext";

const TradeWrite = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { formTradeData, setFormTradeData } = useContext(TradeContext);

  const [contentImages, setContentImages] = useState(formTradeData.contentImages || []);
  const [color, setColor] = useState("#000000");
  const [savedSelection, setSavedSelection] = useState(null);

  useEffect(() => {
    if (editorRef.current && formTradeData.content) {
      editorRef.current.innerHTML = formTradeData.content;
    }
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0));
    }
  };

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const range = savedSelection;
    if (!range) {
      alert("이미지를 삽입할 위치를 에디터 안에서 클릭해주세요.");
      return;
    }

    files.forEach((file) => {
      setContentImages((prev) => [...prev, file]);
      const previewUrl = URL.createObjectURL(file);

      const img = document.createElement("img");
      img.src = previewUrl;
      img.alt = "image";
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.collapse(true);
    });
  };

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);
    handleCommand("foreColor", selectedColor);
  };

  const handleSave = () => {
    const finalHtmlContent = editorRef.current.innerHTML;

    const updatedFormData = {
      ...formTradeData,
      content: finalHtmlContent,
      contentImages: contentImages,
    };

    setFormTradeData(updatedFormData); // ✅ Context로 반영
    navigate("/tradeForm"); // ✅ 상태 전달 생략
  };

  return (
    <div className="container">
      <div className="sale-write-container">
        <header className="sale-write-header">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            <IoIosArrowBack />
          </button>
          <h2 className="title">본문</h2>
          <button type="button" className="save-button" onClick={handleSave}>
            저장
          </button>
        </header>

        <div className="toolbar">
          <button onClick={() => alert("추가 기능 준비 중!")}>+</button>
          <label htmlFor="imageUpload" className="CiImageOn" style={{ cursor: "pointer" }}>
            <CiImageOn />
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <button onClick={() => handleCommand("undo")}><LuUndo2 /></button>
          <button onClick={() => handleCommand("redo")}><LuRedo2 /></button>
        </div>

        <div className="editor-toolbar">
          <button onClick={() => handleCommand("bold")}><b><FaBold /></b></button>
          <button onClick={() => handleCommand("italic")}><i><FaItalic /></i></button>
          <button onClick={() => handleCommand("underline")}><FaUnderline /></button>
          <button onClick={() => handleCommand("strikeThrough")}><FaStrikethrough /></button>
          <button onClick={() => handleCommand("justify")}><FaAlignJustify /></button>
          <button onClick={() => handleCommand("justifyLeft")}><FaAlignLeft /></button>
          <button onClick={() => handleCommand("justifyCenter")}><FaAlignCenter /></button>
          <button onClick={() => handleCommand("justifyRight")}><FaAlignRight /></button>
          <button onClick={() => handleCommand("fontSize", "5")}><RiFontSize /></button>
          <button onClick={() => handleCommand("fontSize", "2")}><p>fontsize</p><FaCaretDown /></button>
          <button onClick={() => handleCommand("insertUnorderedList")}><PiListBulletsBold /></button>
          <button>
            <FaPaintBrush />
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              style={{ width: "30px", height: "30px", marginLeft: "10px", border: "none", padding: 0 }}
            />
          </button>
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
