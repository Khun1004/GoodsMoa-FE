import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const TossRedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderCode = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      // ✅ 1. 쿼리 파라미터 확인 로그
      console.log("👉 Toss redirect params:", { paymentKey, orderCode, amount });

      if (!paymentKey || !orderCode || !amount) {
        alert("결제 정보가 누락되었습니다.");
        navigate("/");
        return;
      }

      try {
        // ✅ 2. 요청 URL 확인 로그
        const requestUrl = `http://localhost:8080/payment/success?orderCode=${orderCode}&paymentKey=${paymentKey}&amount=${amount}`;
        console.log("📡 요청 URL:", requestUrl);

        const res = await fetch(requestUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`결제 확인 실패: ${res.status} - ${errorText}`);
        }

        const orderResponse = await res.json();

        // ✅ 3. 응답 확인 로그
        console.log("✅ 결제 확인 완료:", orderResponse);

        const label = (orderResponse.checkLabel || "").trim().toLowerCase();

        if (label === "sale") {
          navigate("/salePurchasePerfect", {
            state: { orderInfo: orderResponse },
          });
        } else if (label === "trade") {
          navigate(`/tradeBuyPerfect?orderId=${orderResponse.id}`, {
            state: { orderInfo: orderResponse },
          });
        } else {
          console.warn("❓ 알 수 없는 checkLabel:", orderResponse.checkLabel);
          alert("결제는 완료되었으나 거래 유형을 식별할 수 없습니다.");
          navigate("/");
        }

      } catch (err) {
        // // ✅ 4. 에러 전체 로그
        // console.error("❌ 결제 확인 실패:", err);
        // alert("결제 확인 중 오류가 발생했습니다.");
        // navigate("/");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return <div className="pt-[130px]">결제 확인 중입니다...</div>;
};

export default TossRedirectHandler;
