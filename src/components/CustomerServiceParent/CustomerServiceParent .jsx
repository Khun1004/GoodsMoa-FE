import React, { useState } from "react";
import CustomerService from "./CustomerService/CustomerService";
import CustomerServiceReply from "./CustomerServiceReply/CustomerServiceReply";

const CustomerServiceParent = () => {
  const [inquiries, setInquiries] = useState([
    { id: 1, title: "배송 관련 문의", questioner: "홍길동", date: "2025-03-18", status: "답변완료", content: "배송이 언제 되나요?", replyContent: "배송은 2-3일 이내에 도착합니다." },
    { id: 2, title: "환불 가능 여부", questioner: "김철수", date: "2025-03-17", status: "답변하기", content: "환불 가능한가요?", replyContent: "" },
    { id: 3, title: "결제가 안됩니다.", questioner: "이영희", date: "2025-03-20", status: "답변하기", content: "결제가 되지 않아요", replyContent: "" }
  ]);

  const [view, setView] = useState("customerService");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // For CustomerService component
  const handleReplyClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setView("customerServiceReply");
  };

  // For CustomerServiceReply component
  const handleSaveReply = (id, replyContent) => {
    setInquiries(prevInquiries =>
      prevInquiries.map(inquiry =>
        inquiry.id === id
          ? { ...inquiry, status: "답변완료", replyContent }
          : inquiry
      )
    );
    setView("customerService");
  };

  const handleBackToCustomerService = () => {
    setView("customerService");
  };

  return (
    <div>
      {view === "customerService" ? (
        <CustomerService
          inquiries={inquiries}
          setInquiries={setInquiries}
          onReplyClick={handleReplyClick}
        />
      ) : (
        <CustomerServiceReply
          inquiries={inquiries}
          setInquiries={setInquiries}
          selectedInquiry={selectedInquiry}
          onSaveReply={handleSaveReply}
          onBack={handleBackToCustomerService}
        />
      )}
    </div>
  );
};

export default CustomerServiceParent;