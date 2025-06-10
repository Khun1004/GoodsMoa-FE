import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from "react";
import { FaCamera, FaFileAlt, FaGift, FaImage, FaMapMarkerAlt, FaMicrophone, FaMusic, FaPlus, FaSmile } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { IoMdDownload } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import FelixImg from '../../assets/chatting/felix.png';
import RoseImg from '../../assets/chatting/Rosé.png';
import "./ChatApp.css";

const ChatApp = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null
  });

  // 이모지 피커 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
      
      // 컨텍스트 메뉴 외부 클릭 감지
      if (!event.target.closest('.context-menu') && !event.target.closest('.react-button')) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(storedMessages);

    const handleStorageChange = () => {
      const updatedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
      setMessages(updatedMessages);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = { 
        text: message, 
        sender: "me", 
        time: getCurrentTime(),
        id: Date.now() // 고유 ID 추가
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      setMessage("");
      setEmojiPickerOpen(false);
    }
  };

  const sendFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
      // 이미지 파일 처리
      reader.onload = (event) => {
        const newMessage = {
          file: {
            type: 'image',
            url: event.target.result,
            name: file.name,
            size: formatFileSize(file.size)
          },
          sender: "me",
          time: getCurrentTime(),
          id: Date.now() // 고유 ID 추가
        };
        updateMessages(newMessage);
      };
      reader.readAsDataURL(file);
    } else {
      // 일반 파일 처리
      const newMessage = {
        file: {
          type: 'file',
          name: file.name,
          size: formatFileSize(file.size),
          url: URL.createObjectURL(file)
        },
        sender: "me",
        time: getCurrentTime(),
        id: Date.now() // 고유 ID 추가
      };
      updateMessages(newMessage);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateMessages = (newMessage) => {
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
  };

  const openChatOther = () => {
    const chatWindow = window.open("/chat-other", "_blank", "width=600,height=800");
    if (chatWindow) {
      chatWindow.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const shouldShowProfile = (index) => {
    if (index === 0) return true;
    return messages[index].sender !== messages[index - 1].sender;
  };

  const shouldShowTime = (index) => {
    if (index === messages.length - 1) return true;
    if (messages[index].time !== messages[index + 1].time) return true;
    if (messages[index].sender !== messages[index + 1].sender) return true;
    return false;
  };

  // 이모지 선택 핸들러
  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  // 컨텍스트 메뉴 핸들러
  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId: messageId
    });
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuAction = (action) => {
    switch(action) {
      case 'reply':
        alert('답장 기능이 준비 중입니다.');
        break;
      case 'share':
        alert('공유 기능이 준비 중입니다.');
        break;
      case 'my-chatroom':
        alert('내 채팅방 기능이 준비 중입니다.');
        break;
      case 'announce':
        alert('공지 기능이 준비 중입니다.');
        break;
      case 'add-bookmark':
        alert('북마크 추가 기능이 준비 중입니다.');
        break;
      case 'capture':
        alert('캡처 기능이 준비 중입니다.');
        break;
      case 'delete':
        const updatedMessages = messages.filter(msg => msg.id !== contextMenu.messageId);
        setMessages(updatedMessages);
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
        break;
      default:
        break;
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const menuItems = [
    { icon: <FaImage />, label: "앨범", action: () => fileInputRef.current.click() },
    { icon: <FaCamera />, label: "카메라", action: () => alert("카메라 기능 준비 중") },
    { icon: <FaFileAlt />, label: "파일", action: () => fileInputRef.current.click() },
    { icon: <FaMapMarkerAlt />, label: "위치", action: () => alert("위치 공유 기능 준비 중") },
    { icon: <FaMicrophone />, label: "음성 메모", action: () => alert("음성 메모 기능 준비 중") },
    { icon: <FaMusic />, label: "음악", action: () => alert("음악 공유 기능 준비 중") },
    { icon: <FaGift />, label: "선물", action: () => alert("선물 보내기 기능 준비 중") },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setEmojiPickerOpen(false);
  };

  const toggleEmojiPicker = () => {
    setEmojiPickerOpen(!emojiPickerOpen);
    setMenuOpen(false);
  };

  const renderFileMessage = (file) => {
    if (file.type === 'image') {
      return <img src={file.url} alt={file.name} className="message-image" />;
    } else {
      return (
        <div className="file-message">
          <div className="file-icon">
            <FaFileAlt size={24} />
          </div>
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">{file.size}</div>
          </div>
          <a href={file.url} download={file.name} className="file-download">
            <IoMdDownload size={20} />
          </a>
        </div>
      );
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <img src={FelixImg} alt="Felix" className="felix-profile-image" />
          <h2><span className="felixName">Felix</span> 채팅방</h2>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-container ${msg.sender}`}
            onContextMenu={(e) => handleContextMenu(e, msg.id)}
          >
            {msg.sender === "other" && (
              <div className="sender-info">
                {shouldShowProfile(index) && (
                  <>
                    <img src={RoseImg} alt="Rosé" className="other-profile-image" />
                    <span className="rose-name">Rosé</span>
                  </>
                )}
              </div>
            )}
            <div className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.file ? (
                  renderFileMessage(msg.file)
                ) : msg.image ? (
                  <img src={msg.image} alt="전송된 이미지" className="message-image" />
                ) : (
                  <span>{msg.text}</span>
                )}
                {shouldShowTime(index) && <span className="message-time">{msg.time}</span>}
              </div>
            </div>
            {msg.sender === "me" && (
              <div className="sender-info">
                {shouldShowProfile(index) && <img src={FelixImg} alt="Me" className="me-profile-image" />}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <button className="menu-toggle-button" onClick={toggleMenu}>
          {menuOpen ? <ImCross /> : <FaPlus />}
        </button>
        
        <button className="emoji-button" onClick={toggleEmojiPicker}>
          <FaSmile />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
        />
        
        <button onClick={sendMessage} className="send-button">
          전송
        </button>
        <button onClick={openChatOther} className="other-button">
          다른 채팅방
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={sendFile}
          style={{ display: 'none' }}
        />
      </div>

      {emojiPickerOpen && (
        <div className="emoji-picker-container" ref={emojiPickerRef}>
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      )}

      {menuOpen && (
        <div className="chat-menu">
          <div className="menu-grid">
            {menuItems.map((item, index) => (
              <button key={index} onClick={item.action} className="menu-item">
                <div className="menu-icon">{item.icon}</div>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 1000
          }}
        >
          <ul>
            <li onClick={() => handleMenuAction('reply')}>Reply</li>
            <li onClick={() => handleMenuAction('share')}>Share</li>
            <li onClick={() => handleMenuAction('my-chatroom')}>My chatroom</li>
            <li onClick={() => handleMenuAction('announce')}>Announce</li>
            <li onClick={() => handleMenuAction('add-bookmark')}>Add Bookmark</li>
            <li onClick={() => handleMenuAction('capture')}>Capture</li>
            <li onClick={() => handleMenuAction('delete')}>Delete</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatApp;