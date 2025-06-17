import React from "react";
import { BsChatDotsFill } from "react-icons/bs";

const openChatApp = (roomId) => {
    const url = roomId ? `/chat-app?roomId=${roomId}` : "/chat-app";
    const chatWindow = window.open(url, "_blank", "width=1000,height=800");
    if (chatWindow) chatWindow.focus();
};

const Chatting = () => (
    <div
        data-aos="zoom-in"
        className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-yellow-100 
        shadow-lg rounded-2xl flex flex-col items-center justify-center w-20 h-20 
        hover:shadow-xl transition-all duration-300 dark:bg-gray-900"
        style={{ zIndex: 1000 }}
        onClick={() => openChatApp()}
    >
        <div className="text-3xl text-blue-500">
            <BsChatDotsFill />
        </div>
        <div className="text-sm mt-1">채팅</div>
    </div>
);

export default Chatting;
