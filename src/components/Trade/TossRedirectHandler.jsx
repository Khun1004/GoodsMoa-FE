import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TossRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const alreadyCalled = useRef(false); // ✅ 중복 방지

  useEffect(() => {
    if (alreadyCalled.current) return; // ✅ 중복 호출 방지
    alreadyCalled.current = true;

    const query = new URLSearchParams(location.search);
    const orderCode = query.get("orderCode");
    const paymentKey = query.get("paymentKey");
    const amount = query.get("amount");

    if (!orderCode || !paymentKey || !amount) {
      alert("결제 정보가 누락되었습니다.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/payment/success?orderCode=${orderCode}&paymentKey=${paymentKey}&amount=${amount}`,
          { method: "GET", credentials: "include" }
        );

        if (!res.ok) throw new Error("결제 확인 실패");


        const data = await res.json();
      
        // ✅ 디버깅 로그: 응답 전체 확인
    console.log("✅ 결제 확인 성공 응답 데이터:", data);

    // ✅ 각각의 필드도 명확히 확인
    console.log("👉 data.id:", data.id);
    console.log("👉 data.orderId:", data.orderId);


        navigate(`/tradeBuyPerfect?orderId=${data.id}`);

      } catch (err) {
        console.error("❌ 결제 확인 실패:", err);
        alert("결제 승인 중 오류가 발생했습니다.");
      }
    };

    confirmPayment();
  }, [location, navigate]);

  return <div>결제 완료 처리 중입니다...</div>;
};

export default TossRedirectHandler;
