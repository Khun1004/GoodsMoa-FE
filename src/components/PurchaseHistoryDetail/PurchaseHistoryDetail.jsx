import React from 'react';
import { FaArrowLeft, FaBox, FaCheckCircle, FaTruck } from 'react-icons/fa';
import './PurchaseHistoryDetail.css';

const PurchaseHistoryDetail = ({ purchase, onClose }) => {
    if (!purchase) {
        return <div>Loading...</div>;
    }

    // 상태에 따른 진행 단계 계산
    const getActiveStep = () => {
        switch(purchase.status) {
            case '결제 완료':
                return 1;
            case '상품 준비 중':
                return 2;
            case '배송 중':
                return 3;
            case '배송 완료':
                return 4;
            default:
                return 1;
        }
    };

    const activeStep = getActiveStep();

    return (
        <div className="container">
            <div className="phd-container">
                {/* 헤더 */}
                <div className="phd-header">
                    <button onClick={onClose} className="phd-back-button">
                        <FaArrowLeft /> 뒤로 가기
                    </button>
                    <h1 className="phd-title">구매내역</h1>
                </div>

                {/* 내용 */}
                <div className="phd-content">
                    {/* 상태 표시 */}
                    <section className="phd-status-section">
                        <h2 className="phd-status-title">{purchase.status}</h2>
                        <div className="phd-progress-bar">
                            <div className={`phd-progress-step ${activeStep >= 1 ? 'phd-active' : ''}`}>
                                <div className="phd-step-icon"><FaBox /></div>
                                <span className="phd-step-label">결제완료</span>
                            </div>
                            <div className="phd-progress-connector"></div>
                            <div className={`phd-progress-step ${activeStep >= 2 ? 'phd-active' : ''}`}>
                                <div className="phd-step-icon"><FaBox /></div>
                                <span className="phd-step-label">상품준비중</span>
                            </div>
                            <div className="phd-progress-connector"></div>
                            <div className={`phd-progress-step ${activeStep >= 3 ? 'phd-active' : ''}`}>
                                <div className="phd-step-icon"><FaTruck /></div>
                                <span className="phd-step-label">배송중</span>
                            </div>
                            <div className="phd-progress-connector"></div>
                            <div className={`phd-progress-step ${activeStep >= 4 ? 'phd-active' : ''}`}>
                                <div className="phd-step-icon"><FaCheckCircle /></div>
                                <span className="phd-step-label">배송완료</span>
                            </div>
                        </div>
                    </section>

                    {/* 상품 정보 */}
                    <section className="phd-product-section">
                        {purchase.products.map((product, index) => (
                            <div className="phd-product-item" key={index}>
                                <img src={product.image} alt={product.name} className="phd-product-image" />
                                <div className="phd-product-info">
                                    <h3 className="phd-product-name">{product.name}</h3>
                                    <p className="phd-product-price">{product.price.toLocaleString()}원</p>
                                    <p className="phd-product-quantity">수량: {product.quantity}개</p>
                                    <p className="phd-product-category">카테고리: {product.category || '미분류'}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    <div className="phd-divider"></div>

                    {/* 주문자 정보 */}
                    <section className="phd-info-section">
                        <h2 className="phd-section-title">주문자 정보</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">주문자명</span>
                            <span className="phd-info-value">{purchase.formData?.recipient_name || purchase.ordererName}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">주문자 연락처</span>
                            <span className="phd-info-value">{purchase.formData?.phone_number || purchase.ordererPhone || 'N/A'}</span>
                        </div>
                    </section>

                    <div className="phd-divider"></div>

                    {/* 주문 정보 */}
                    <section className="phd-info-section">
                        <h2 className="phd-section-title">주문 정보</h2>
                        
                        {/* 상품별 정보 표시 */}
                        {purchase.products?.map((product, index) => (
                            <React.Fragment key={index}>
                                <div className="phd-info-row">
                                    <span className="phd-info-label">상품명</span>
                                    <span className="phd-info-value">{product.name}</span>
                                </div>
                                <div className="phd-info-row">
                                    <span className="phd-info-label">수량</span>
                                    <span className="phd-info-value">{product.quantity}개</span>
                                </div>
                                <div className="phd-info-row">
                                    <span className="phd-info-label">상품가격</span>
                                    <span className="phd-info-value">{product.price?.toLocaleString() ?? '0'}원</span>
                                </div>
                            </React.Fragment>
                        ))}

                        {/* 총 상품 금액 */}
                        <div className="phd-info-row">
                            <span className="phd-info-label">총 상품 금액</span>
                            <span className="phd-info-value">
                                {(purchase.products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) ?? 0).toLocaleString()}원
                            </span>
                        </div>

                        {/* 배송비 표시 - 이 부분을 강조하여 표시 */}
                        <div className="phd-info-row">
                            <span className="phd-info-label">배송비</span>
                            <span className="phd-info-value">
                                {purchase.deliveryFee ? 
                                    `${purchase.deliveryFee.toLocaleString()}원` : 
                                    purchase.selectedDelivery?.price === 0 ? 
                                    '무료' : 
                                    '0원'}
                            </span>
                        </div>

                        {/* 배송 방법 표시 */}
                        <div className="phd-info-row">
                            <span className="phd-info-label">배송 방법</span>
                            <span className="phd-info-value">
                                {purchase.selectedDelivery?.name || 
                                (typeof purchase.selectedDelivery === 'string' ? purchase.selectedDelivery : '기본 배송')}
                                {purchase.selectedDelivery?.price ? 
                                    ` (${purchase.selectedDelivery.price.toLocaleString()}원)` : 
                                    purchase.deliveryFee ? 
                                    ` (${purchase.deliveryFee.toLocaleString()}원)` : 
                                    ' (무료)'}
                            </span>
                        </div>

                        {/* 최종 결제 금액 */}
                        <div className="phd-info-row">
                            <span className="phd-info-label">최종 결제 금액</span>
                            <span className="phd-info-value">
                                {(
                                    (purchase.products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) ?? 0) + 
                                    (purchase.deliveryFee ?? 0)
                                ).toLocaleString()}원
                            </span>
                        </div>
                    </section>

                    <div className="phd-divider"></div>

                    {/* 배송 정보 */}
                    <section className="phd-info-section">
                        <h2 className="phd-section-title">배송 정보</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">받는사람</span>
                            <span className="phd-info-value">{purchase.formData?.recipient_name || purchase.ordererName}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">연락처</span>
                            <span className="phd-info-value">{purchase.formData?.phone_number || purchase.ordererPhone || 'N/A'}</span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">주소</span>
                            <span className="phd-info-value">
                                {purchase.formData?.zipCode ? `(${purchase.formData.zipCode}) ` : ''}
                                {purchase.formData?.mainAddress || ''}
                                {purchase.formData?.detailedAddress ? `, ${purchase.formData.detailedAddress}` : ''}
                                {!purchase.formData?.mainAddress && !purchase.formData?.detailedAddress && 'N/A'}
                            </span>
                        </div>
                        <div className="phd-info-row">
                            <span className="phd-info-label">배송 메모</span>
                            <span className="phd-info-value">{purchase.formData?.deliveryMemo || 'N/A'}</span>
                        </div>
                    </section>

                    <div className="phd-divider"></div>

                    {/* 송장번호 */}
                    <section className="phd-info-section">
                        <h2 className="phd-section-title">송장번호</h2>
                        <div className="phd-info-row">
                            <span className="phd-info-label">송장번호</span>
                            <span className="phd-info-value phd-tracking-value">
                                {purchase.tracking?.number || '아직 송장번호가 입력되지 않았어요.'}
                            </span>
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