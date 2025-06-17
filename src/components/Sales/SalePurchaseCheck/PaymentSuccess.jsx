import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OrderSaleDetail from "../../../api/OrderSaleDetail";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPaymentResult = async () => {
            const paymentKey = searchParams.get("paymentKey");
            const orderCode = searchParams.get("orderId");
            const amount = searchParams.get("amount");

            if (!paymentKey || !orderCode || !amount) {
                alert("결제 정보가 누락되었습니다.");
                navigate("/");
                return;
            }

            try {
                const response = await OrderSaleDetail.confirmTossPayment(
                    paymentKey,
                    orderCode,
                    Number(amount) // ⚠️ amount는 숫자로 변환
                );

                console.log("✅ 결제 확인 성공:", response);

                navigate("/salePurchasePerfect", {
                    state: { orderInfo: response },
                });
            } catch (error) {
                console.error("❌ 결제 확인 실패:", error);
                alert("결제 확인 중 오류가 발생했습니다.");
                navigate("/");
            }
        };

        fetchPaymentResult();
    }, [searchParams, navigate]);

    return (
        <div className="pt-[130px] text-center">
            <h2 className="text-xl font-bold">✅ 결제 확인 중입니다...</h2>
        </div>
    );
}
