
import React from 'react';
import { FaArrowLeft, FaBox, FaCheckCircle, FaTruck } from 'react-icons/fa';
import './PurchaseHistoryDetail.css';

const PurchaseHistoryDetail = ({ purchase, onClose }) => {
    if (!purchase) {
        return <div>Loading...</div>;
    }

    const getActiveStep = () => {
        switch (purchase.status) {
            case '결제 완료': return 1;
            case '상품 준비 중': return 2;
            case '배송 중': return 3;
            case '배송 완료': return 4;
            default: return 1;
        }
    };

    const activeStep = getActiveStep();

    return (
        <div className="container">
            <div className="phd-container">
                <div className="phd-header">
                    <button onClick={onClose} className="phd-back-button">
                        <FaArrowLeft /> 뒤로 가기
                    </button>
                    <h1 className="phd-title">구매내역</h1>
                </div>

                <div className="phd-content">
                    <section className="phd-status-section">
                        <h2 className="phd-status-title">{purchase.status}</h2>
                        <div className="phd-progress-bar">
                            {[1, 2, 3, 4].map((step, idx) => (
                                <React.Fragment key={idx}>
                                    <div className={`phd-progress-step ${activeStep >= step ? 'phd-active' : ''}`}>
                                        <div className="phd-step-icon">
                                            {step === 3 ? <FaTruck /> : step === 4 ? <FaCheckCircle /> : <FaBox />}
                                        </div>
                                        <span className="phd-step-label">
                                            {['결제완료', '상품준비중', '배송중', '배송완료'][idx]}
                                        </span>
                                    </div>
                                    {step < 4 && <div className="phd-progress-connector"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </section>



                    <section className="phd-product-section">
                        {purchase.products.map((product, index) => (
                            <div className="phd-product-item" key={index}>
                                {product.image && (
                                    <img src={`http://localhost:8080/${product.image}`} alt={product.name} className="phd-product-image" />
                                )}
                                <div className="phd-product-info">
                                    <h3 className="phd-product-name">{product.name}</h3>
                                    <p className="phd-product-price">{product.price.toLocaleString()}원</p>
                                    <p className="phd-product-quantity">수량: {product.quantity}개</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="phd-info-section">
                        <h2 className="phd-section-title">주문자 정보</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">주문자명</span>
                            <span className="phd-info-value">{purchase.recipientName || '미확인'}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">주문자 연락처</span>
                            <span className="phd-info-value">{purchase.phoneNumber || '미확인'}</span>
                        </div>
                    </section>

                    <div className="phd-divider"></div>

                    <section className="phd-info-section">
                        <h2 className="phd-section-title">주문 정보</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">대표 상품명</span>
                            <span className="phd-info-value">{purchase.orderName}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">카테고리</span>
                            <span className="phd-info-value">{purchase.categoryName}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">총 상품 금액</span>
                            <span className="phd-info-value">{purchase.productsPrice.toLocaleString()}원</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">배송비</span>
                            <span className="phd-info-value">
                                {purchase.deliveryPrice > 0 ? `${purchase.deliveryPrice.toLocaleString()}원` : '무료'}
                            </span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">배송 방법</span>
                            <span className="phd-info-value">{purchase.deliveryName}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">최종 결제 금액</span>
                            <span className="phd-info-value">{purchase.totalPrice.toLocaleString()}원</span>
                        </div>
                    </section>

                    <div className="phd-divider"></div>

                    <section className="phd-info-section">
                        <h2 className="phd-section-title">받는 사람 정보</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">이름</span>
                            <span className="phd-info-value">{purchase.recipientName}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">연락처</span>
                            <span className="phd-info-value">{purchase.phoneNumber}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">주소</span>
                            <span className="phd-info-value">{purchase.mainAddress}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">배송 메모</span>
                            <span className="phd-info-value">{purchase.postMemo || '없음'}</span>
                        </div>
                    </section>

                    <div className="phd-divider"></div>

                    <section className="phd-info-section">
                        <h2 className="phd-section-title">송장 정보</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">송장번호</span>
                            <span className="phd-info-value">{purchase.tracking?.number || '등록되지 않음'}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">택배사</span>
                            <span className="phd-info-value">{purchase.tracking?.company || '미정'}</span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PurchaseHistoryDetail;
