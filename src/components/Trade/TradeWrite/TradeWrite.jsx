import React, { useEffect, useRef, useState, useContext } from "react";
import { CiImageOn } from "react-icons/ci";
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaBold, FaCaretDown, FaItalic, FaPaintBrush, FaStrikethrough, FaUnderline } from "react-icons/fa";
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

  const [contentImages, setContentImages] = useState([]);
  const [color, setColor] = useState("#000000");
  const [descriptions, setDescriptions] = useState(
    Array.isArray(formTradeData?.description) ? formTradeData.description : []
  );
  const [contentImageFiles, setContentImageFiles] = useState(
    formTradeData?.contentImageFiles || []
  );
  const [savedSelection, setSavedSelection] = useState(null);

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
    if (files.length === 0) {
      alert("이미지를 선택해주세요.");
      return;
    }

    files.forEach((file) => {
      const localUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = localUrl;
      img.alt = "image";

      if (savedSelection) {
        const range = savedSelection.cloneRange();
        range.deleteContents();
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.appendChild(img);
      }

      editorRef.current.focus();
    });

    setContentImageFiles((prev) => [...prev, ...files]);
    setContentImages((prev) => [...prev, ...files]);
  };

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);
    document.execCommand("foreColor", false, selectedColor);
  };

const handleSave = () => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = editorRef.current.innerHTML;
  const nodes = Array.from(tempDiv.childNodes);

  const parsedDescriptions = [];
  let sequenceCounter = 0;
  let detectedImageCount = 0;

  nodes.forEach((node) => {
    if (node.nodeName === "IMG") {
      parsedDescriptions.push({ type: "IMAGE", value: "", sequence: sequenceCounter++ });
      detectedImageCount++;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.innerText || node.textContent;
      if (text.trim()) {
        parsedDescriptions.push({ type: "TEXT", value: text.trim(), sequence: sequenceCounter++ });
      }
      const imgs = node.getElementsByTagName("img");
      for (let img of imgs) {
        parsedDescriptions.push({ type: "IMAGE", value: "", sequence: sequenceCounter++ });
        detectedImageCount++;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        parsedDescriptions.push({ type: "TEXT", value: text, sequence: sequenceCounter++ });
      }
    }
  });

  if (detectedImageCount !== contentImages.length) {
    alert(`에디터에 들어간 이미지 수(${detectedImageCount})와 업로드된 이미지 수(${contentImages.length})가 다릅니다.`);
    return;
  }

  const updatedFormData = {
    ...formTradeData,
    description: parsedDescriptions,
    contentImageFiles: contentImages,
    detailImages: formTradeData.detailImages || [],
    detailImageFiles: formTradeData.detailImageFiles || [],
  };

  console.log("✅ 저장 직전 updatedFormData 확인:", updatedFormData);

  setFormTradeData(updatedFormData);

  navigate("/tradeForm", {
    state: {
      formTradeData: updatedFormData,
      isEditMode: !!updatedFormData.id,
    },
  });
};


  useEffect(() => {
    if (editorRef.current && descriptions.length > 0) {
      const html = descriptions.map((desc) => {
        if (desc.type === "IMAGE") return `<img src='${desc.value}' alt='image' />`;
        if (desc.type === "TEXT") return `<p>${desc.value}</p>`;
        return "";
      }).join("");
      editorRef.current.innerHTML = html;
    }
  }, [descriptions]);

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
        />

      </div>
    </div>
  );
};

export default TradeWrite;
