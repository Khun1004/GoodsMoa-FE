import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TradeBuy.css";

const TradeBuy = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    wantedProducts = [],
    saleLabel = "중고거래",
    isDirectTrade = false,
  } = location.state || {};

  const item = wantedProducts[0];

  const [deliveryAddress, setDeliveryAddress] = useState(
    isDirectTrade ? item?.directTradeLocation || "" : ""
  );
  const [detailAddress, setDetailAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  const totalPrice = item ? item.price : 0;

  const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return "/default-image.jpg";
  return path.startsWith("http") ? path : `http://localhost:8080/${path.replace(/^\/?/, "")}`;
};

  // 대표 이미지 처리
  const representativeImage = getImageUrl(item?.representativeImage || item?.image);

  // 상세 이미지들 처리
  const images = Array.isArray(item?.detailImages) && item.detailImages.length > 0
  ? item.detailImages
      .filter((img) => img?.imagePath && typeof img.imagePath === "string")
      .map((img) => getImageUrl(img.imagePath))
  : [getImageUrl(item?.representativeImage || item?.image)];

  useEffect(() => {
    if (images.length > 1) {
      const slider = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(slider);
    }
  }, [images.length]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setDeliveryAddress(data.address);
        setDetailAddress("");
      },
    }).open();
  };

  const handleConfirmPurchase = async () => {
    if (!isDirectTrade && (!deliveryAddress || !detailAddress)) {
      alert("배송지를 입력해 주세요.");
      return;
    }

    const addressInfo = isDirectTrade
      ? `직접 거래 장소: ${item?.directTradeLocation}`
      : `배송지: ${deliveryAddress} ${detailAddress}`;

    alert(`구매가 완료되었습니다!\n${addressInfo}`);

    navigate("/tradeBuyPerfect", {
      state: {
        item,
        deliveryAddress: isDirectTrade ? item?.directTradeLocation : deliveryAddress,
        detailAddress: isDirectTrade ? "" : detailAddress,
        deliveryNote,
        paymentMethod,
        isDirectTrade,
      },
    });
  };
  console.log("대표 이미지:", representativeImage);
console.log("상세 이미지 목록:", images);

  return (
    <div className="container">
      <div className="trade-buy-container">
        <h1 className="tradeBuy-title">구매하기</h1>

        <div className="trade-buy-layout">
          {/* 왼쪽: 이미지 슬라이드 */}
          <div className="trade-buy-slider">
            <img
              src={images[currentIndex]}
              alt="상품 이미지"
              className="trade-buy-slider-image"
            />
          </div>

          {/* 오른쪽: 상품 정보 및 구매 입력 */}
          <div className="trade-buy-info">
            <div className="trade-buy-summary">
              <img
                src={representativeImage}
                alt="대표 이미지"
                className="trade-buy-main-image"
              />
              <div className="trade-buy-summary-details">
                <h2 className="trade-buy-title">{item?.name}</h2>
                <p className="trade-buy-price">{item?.price}원</p>
                <p className="trade-buy-condition">상태: {item?.condition}</p>
                <p className="trade-buy-location">
                  거래 방식:{" "}
                  {isDirectTrade
                    ? `직접 거래 (${item?.directTradeLocation || item?.location})`
                    : "택배 거래"}
                </p>
              </div>
            </div>

            <div className="trade-buy-form">
              <label>배송지 입력:</label>
              {isDirectTrade ? (
                <p className="direct-trade-notice">
                  직접 거래로 진행됩니다. 판매자와 거래 장소를 확인해주세요.
                </p>
              ) : (
                <>
                  <div className="trade-buy-address-container">
                    <input
                      type="text"
                      value={deliveryAddress}
                      readOnly
                      placeholder="주소를 입력하세요."
                      className="trade-buy-address-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="trade-buy-address-button"
                    >
                      주소 검색
                    </button>
                  </div>
                  <label>상세 주소 입력:</label>
                  <input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="상세 주소를 입력하세요."
                    className="trade-buy-detail-address-input"
                  />
                </>
              )}
              {!isDirectTrade && (
  <>
    <label>배송 메모:</label>
    <textarea
      placeholder="요청 사항을 입력하세요."
      value={deliveryNote}
      onChange={(e) => setDeliveryNote(e.target.value)}
      className="trade-buy-textarea"
    ></textarea>

    <label>결제 수단 선택:</label>
    <select
      value={paymentMethod}
      onChange={(e) => setPaymentMethod(e.target.value)}
      className="trade-buy-select"
    >
      <option value="creditCard">신용카드</option>
      <option value="bankTransfer">계좌이체</option>
      <option value="kakaoPay">카카오페이</option>
      <option value="naverPay">네이버페이</option>
      <option value="tossPay">토스페이</option>
    </select>

    {paymentMethod === "bankTransfer" && (
      <p className="trade-buy-bank-info">
        해당 계좌번호로 입금해주세요: 123-456-7890 (OO은행)
      </p>
    )}
  </>
)}


              <h3 className="trade-buy-total-price">
                총 결제 금액: {totalPrice}원
              </h3>
            </div>

            <div className="trade-buy-button-container">
              <button className="trade-buy-confirm-button" onClick={handleConfirmPurchase}>
                구매 확정
              </button>
              <button className="trade-buy-cancel-button" onClick={() => navigate("/trade")}>
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeBuy;
