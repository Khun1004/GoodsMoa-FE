import React, { useEffect, useRef, useState, useContext ,useCallback} from "react";
import { LoginContext } from "../../contexts/LoginContext";
import EmojiPicker from 'emoji-picker-react';
import { FaCamera, FaFileAlt, FaGift, FaImage, FaMapMarkerAlt, FaMicrophone, FaMusic, FaPlus, FaSmile } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { IoMdDownload } from "react-icons/io";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import "./ChatApp.css";
import MessageItem from '../MessageItem/MessageItem';
import api from '../../api/api';

const WS_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ChatApp() {
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const { isLoading, isLogin, userInfo } = useContext(LoginContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false, x: 0, y: 0, messageId: null
  });

  const messagesEndRef = useRef(null);
  const roomStompClient = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const stompClient = useRef(null);
  const myUserId = userInfo?.id;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    if (roomId) setCurrentRoomId(roomId);
  }, [])

  // ===== 채팅방 리스트 불러오기 =====
  const fetchChatRooms = useCallback( async ()  => {
    if (isLoading || !myUserId) return;
    try {
      const response = await api.get("/chatroom/rooms/list");
      setChatRooms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("채팅방 목록 불러오기 실패", err);
      setChatRooms([]);
    }
  }, [myUserId, isLoading]); 

  // ===== 최초 렌더링 시 채팅방 목록 불러오기 =====
  useEffect(() => {
    // ✨ 4. 여기서도 "로딩 중이 아닐 때" 라는 조건을 확인합니다.
    if (!isLoading && myUserId) {
        fetchChatRooms();
    }
  }, [isLoading, myUserId, fetchChatRooms]); // 의존성 배열에 isLoading 추가



  // ===== [추가] 채팅방 목록 실시간 업데이트용 WebSocket =====
  useEffect(() => {
    if (isLoading || !myUserId) return;

    const userUpdateClient = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
      debug: (str) => console.log(new Date(), `[User WS] ${str}`),
      reconnectDelay: 10000,
    });

    userUpdateClient.onConnect = () => {
      console.log(`✅ [User WS] 개인 알림 채널 연결 성공. 구독 주소: /queue/user/${myUserId}/update`);
      userUpdateClient.subscribe(`/queue/user/${myUserId}/update`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('🔥 [User WS] 새 업데이트 수신!', notification);
          // 새 메시지 알림을 받으면 채팅방 목록을 새로고침
        fetchChatRooms();
        
      });
    };

    userUpdateClient.activate();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (userUpdateClient.active) {
        userUpdateClient.deactivate();
        console.log("ℹ️ [User WS] 개인 알림 채널 연결 종료");
      }
    };
  }, [isLoading, myUserId, fetchChatRooms]);


  // ===== 채팅방 생성 =====
  const handleCreateRoom = async (sellerId, postTitle) => { // 1. 인자 추가
    if (!userInfo?.id) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    // 2. prompt 대신 인자로 받은 sellerId를 사용
    const senderId = userInfo.id;
    const receiverId = sellerId; 

    // 현재 사용자와 판매자가 같으면 채팅방 생성 방지
    if (senderId === receiverId) {
        alert("자기 자신과는 채팅할 수 없습니다.");
        return;
    }

    // 3. 채팅방 제목을 게시글 제목으로 자동 설정
    

    console.log(`채팅방 생성 시도: ${senderId}(구매자) -> ${receiverId}(판매자)`);

    try {
      const res = await api.post("/chatroom/room/create", {
        senderId,
        receiverId,
        title: newRoomTitle,
      });
      alert("채팅방이 생성되었습니다.");
      // 필요시: const roomData = res.data;
    } catch (err) {
      alert("채팅방 생성에 실패했습니다.");
    }
  };
  // ... (이하 다른 함수들은 그대로 유지) ...
  
    // ===== 채팅방 참여 =====
    const handleJoinRoom = async (roomId) => {
        if (!userInfo?.nickname) {
            alert("로그인이 필요합니다.");
            return;
        }
        setCurrentRoomId(roomId);
    };

    // WebSocket 연결 로직 등 ...
    useEffect(() => {
        if (isLoading ||!currentRoomId || !myUserId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
          try {
            const response = await api.get(`/chatroom/room/${currentRoomId}/messages`);
            setMessages(response.data);
          } catch (err) {
            console.error("메시지 로딩 실패:", err);
            setMessages([]);
          }
        };
        fetchMessages();

        const client = new Client({
          webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
          
          debug: (str) => console.log(new Date(), str),
          reconnectDelay: 5000,
          onConnect: () => {
              console.log("✅ STOMP: 연결 성공");
    
              // --- 2-1. 새 메시지 구독 ---
              client.subscribe(`/queue/chat/${currentRoomId}`, (message) => {
                const newMessage = JSON.parse(message.body);
                console.log("🔥 [새 메시지 수신] 서버로부터 받은 객체:", newMessage);
                setMessages(prev => [...prev, newMessage]);
    
                // 내가 보낸 메시지가 아니라면 즉시 읽음 처리 요청
                // 이 부분은 이미 있지만, 위치를 다시 확인합니다.
                if (newMessage.senderId !== myUserId) {
                  // 이 요청은 기다릴 필요 없이 바로 보냅니다.
                  api.post("/chat/read", { chatRoomId: currentRoomId })
                  .catch(err => console.error("❌ 읽음 처리 요청 에러:", err));
                }
              });
                // --- 2-2. 읽음 처리 알림 구독 ---
                client.subscribe(`/queue/chat/${currentRoomId}/read`, (message) => {
                  const readMessageIds = JSON.parse(message.body);
    
                  if (readMessageIds.length > 0) {
                      console.log("✅ [실시간 읽음 처리] 수신된 ID 목록:", readMessageIds, `타입: ${typeof readMessageIds[0]}`);
                  }
    
                  const readIdSet = new Set(readMessageIds.map(id => String(id)));
    
                  setMessages(prevMessages => {
                      if (prevMessages.length > 0) {
                          console.log("📝 [업데이트 전] 현재 메시지 상태 ID:", prevMessages[0].id, `타입: ${typeof prevMessages[0].id}`);
                      }
    
                      return prevMessages.map(msg =>
                          readIdSet.has(String(msg.id))
                              ? { ...msg, isRead: true }
                              : msg
                      );
                  });
                  fetchChatRooms(); 
              });
              // --- 3. 채팅방 입장 후, 안 읽은 메시지 읽음 처리 요청 ---
              api.post("/chat/read", { chatRoomId: currentRoomId })
              .then(() => console.log(`✅ 채팅방 ${currentRoomId} 입장, 읽음 처리 요청 완료.`))
              .catch(err => console.error("❌ 읽음 처리 요청 에러:", err));
         },
         onStompError: (frame) => console.error("❌ STOMP 에러", frame),
    });
    
      // --- 4. 연결 활성화 ---
      client.activate();
      stompClient.current = client;
    
      // --- 5. 컴포넌트 언마운트 시 연결 해제 ---
      return () => {
          if (stompClient.current && stompClient.current.active) {
              stompClient.current.deactivate();
              console.log("ℹ️ STOMP: 연결 종료");
          }
      };
    }, [isLoading, currentRoomId, myUserId, fetchChatRooms]); // ✅ 의존성 배열에 myUserId도 추가

  
    const sendMessage = () => {
      if (message.trim() === '' || !stompClient.current?.connected) return;
      stompClient.current.publish({
          destination: `/pub/chat`,
          body: JSON.stringify({
              chatRoomId: currentRoomId,
              content: message,
              type: "CHAT"
          })
      });
      setMessage("");
      api.get("/chatroom/rooms/list")
      .then(res => setChatRooms(Array.isArray(res.data) ? res.data : []));
  };

    const handleKeyDown = (e) => {
        if (e.nativeEvent.isComposing) return; 
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const shouldShowSenderInfo = (index) => {
        if (index === 0) return true;
        const currentMessage = messages[index];
        const previousMessage = messages[index - 1];
        return currentMessage.senderId !== previousMessage.senderId;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function formatTime(timeString) {
      if (!timeString) return "";
      const date = new Date(timeString);
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  // ... (이하 렌더링 로직은 그대로 유지) ...
  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="chat-layout">
      {/* 왼쪽: 채팅방 리스트 */}
      <div className="chatroom-list-container">
        <h2>채팅방 목록</h2>
        <ul className="chatroom-list">
          {(chatRooms || []).map(room => (
            <li
              key={room.id}
              className={`chatroom-list-item${room.id === currentRoomId ? " selected" : ""}`}
              onClick={() => setCurrentRoomId(room.id)}
            >
              <img
                src={room.sellerProfileImage || "/profile.jpeg"}
                className="chatroom-avatar"
              />
              <div className="chatroom-info">
                <div className="chatroom-title-row">
                  <span className="chatroom-nickname">{room.sellerNickname}</span>
                  
                </div>
                <div className="chatroom-last-message">
                  {room.lastMessageContent || "대화를 시작해보세요!"}
                </div>
              </div>
              <div className="chatroom-meta">
                  <span className="chatroom-time">{formatTime(room.lastMessageTime)}</span>
                  {room.unreadCount > 0 && (
                    <span className="chatroom-unread-badge">{room.unreadCount}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 오른쪽: 채팅창 (선택된 방만 표시) */}
      <div className="chat-container">
        {currentRoomId ? (
          <>
            <div className="chat-header">
              <h3>
                {(() => {
                  const room = chatRooms.find(r => r.id === currentRoomId);
                  if (!room) return `채팅방 ${currentRoomId}`;1
                  return room.sellerNickname
                    ? `${room.sellerNickname}님의 채팅방`
                    : `채팅방 ${currentRoomId}`;
                })()}
              </h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  msg={msg}
                  myUserId={myUserId}
                  showSenderInfo={shouldShowSenderInfo(index)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요"
              />
              <button onClick={sendMessage} className="send-button">
                전송
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat">채팅방을 선택하세요</div>
        )}
      </div>
    </div>
  );
}
