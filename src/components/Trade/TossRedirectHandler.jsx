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

      if (!paymentKey || !orderCode || !amount) {
        alert("결제 정보가 누락되었습니다.");
        navigate("/");
        return;
      }

      try {
        const res = await fetch(
            `http://localhost:8080/payment/success?orderCode=${orderCode}&paymentKey=${paymentKey}&amount=${amount}`,
            { method: "GET", credentials: "include" }
        );

        if (!res.ok) throw new Error("결제 확인 실패");
        const orderResponse = await res.json();

        console.log("✅ 결제 확인 완료:", orderResponse);
        const label = (orderResponse.checkLabel || "").trim().toLowerCase();

        console.log('orderResponse.checkLabel ::: ',orderResponse.checkLabel);

        if (label === "sale") {
          navigate("/salePurchasePerfect", {
            state: { orderInfo: orderResponse },
          });
        } else if (label === "trade") {
          navigate(`/tradeBuyPerfect?orderId=${orderResponse.id}`, {
            state: { orderInfo: orderResponse },
          });
        } else {
          console.warn("알 수 없는 checkLabel:", orderResponse.checkLabel);
        }

      } catch (err) {
        console.error("❌ 결제 확인 실패:", err);
        alert("결제 확인 중 오류가 발생했습니다.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return <div className="pt-[130px]">결제 확인 중입니다...</div>;
};

export default TossRedirectHandler;
