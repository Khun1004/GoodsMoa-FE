import { useState } from "react";
import './SellerRegistration.css';

const SellerRegistration = () => {
    const [sellerType, setSellerType] = useState("일반");
    const [idConsent, setIdConsent] = useState(false);
    const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [representativeName, setRepresentativeName] = useState("");

    return (
        <div className="container">
            <div className='seller-registration-container'>
                <div className='seller-registration'>
                    <h2 className="registration-title">안심 판매자 등록</h2>
                    <p className="registration-description">
                        입력하신 정보가 정확하지 않을 경우 안심결제 및 스마트 무통장 이용이 불가능할 수 있습니다.
                    </p>

                    <div className="seller-type-selection">
                        <button
                            className={`seller-type-btn ${sellerType === "일반" ? "selected" : ""}`}
                            onClick={() => setSellerType("일반")}
                            type="button"
                        >
                            일반
                        </button>
                        <button
                            className={`seller-type-btn ${sellerType === "사업자" ? "selected" : ""}`}
                            onClick={() => setSellerType("사업자")}
                            type="button"
                        >
                            사업자
                        </button>
                    </div>

                    <form className="registration-form">
                        {sellerType === "일반" ? (
                            <>
                                <div className="registration-input-group">
                                    <label className="registration-input-label">주민등록번호</label>
                                    <div className="registration-id-input-group">
                                        <input 
                                            type="text" 
                                            maxLength="6" 
                                            className="registration-id-input" 
                                            placeholder="앞 6자리" 
                                            inputMode="numeric"
                                        />
                                        <span>-</span>
                                        <input 
                                            type="password" 
                                            maxLength="7" 
                                            className="registration-id-input" 
                                            placeholder="뒤 7자리" 
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <div className="registration-checkbox-group">
                                        <input 
                                            type="checkbox" 
                                            id="id-consent" 
                                            checked={idConsent}
                                            onChange={(e) => setIdConsent(e.target.checked)}
                                        />
                                        <label htmlFor="id-consent">정산을 위한 주민등록번호 수집에 동의합니다</label>
                                    </div>
                                </div>

                                <div className="registration-input-group">
                                    <label className="registration-input-label">예금주</label>
                                    <input 
                                        type="text" 
                                        className="registration-text-input" 
                                        placeholder="예금주 명" 
                                    />
                                    <p className="registration-input-hint">정산 계좌의 예금주와 본인인증 받은 성함이 일치해야 합니다.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="registration-input-group">
                                    <label className="registration-input-label">사업자등록번호</label>
                                    <input 
                                        type="text" 
                                        className="registration-text-input" 
                                        placeholder="사업자등록번호 10자리 (- 없이 입력)" 
                                        value={businessRegistrationNumber}
                                        onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                                        inputMode="numeric"
                                        maxLength="10"
                                    />
                                </div>

                                <div className="registration-input-group">
                                    <label className="registration-input-label">상호명</label>
                                    <input 
                                        type="text" 
                                        className="registration-text-input" 
                                        placeholder="상호명을 입력해주세요" 
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                    />
                                </div>

                                <div className="registration-input-group">
                                    <label className="registration-input-label">대표자명</label>
                                    <input 
                                        type="text" 
                                        className="registration-text-input" 
                                        placeholder="대표자명을 입력해주세요" 
                                        value={representativeName}
                                        onChange={(e) => setRepresentativeName(e.target.value)}
                                    />
                                </div>

                                <div className="registration-input-group">
                                    <label className="registration-input-label">예금주</label>
                                    <input 
                                        type="text" 
                                        className="registration-text-input" 
                                        placeholder="예금주 명" 
                                    />
                                    <p className="registration-input-hint">정산 계좌의 예금주와 사업자등록증상 대표자명이 일치해야 합니다.</p>
                                </div>
                            </>
                        )}

                        <div className="registration-input-group">
                            <label className="registration-input-label">은행</label>
                            <select className="registration-dropdown-input">
                                <option value="">은행을 선택해주세요.</option>
                                <option value="국민은행">국민은행</option>
                                <option value="신한은행">신한은행</option>
                                <option value="우리은행">우리은행</option>
                                <option value="하나은행">하나은행</option>
                                <option value="농협은행">농협은행</option>
                                <option value="기업은행">기업은행</option>
                                <option value="카카오뱅크">카카오뱅크</option>
                                <option value="토스뱅크">토스뱅크</option>
                            </select>
                        </div>

                        <div className="registration-input-group">
                            <label className="registration-input-label">계좌번호</label>
                            <input 
                                type="text" 
                                className="registration-text-input" 
                                placeholder="계좌번호를 입력해주세요 (- 없이)" 
                                inputMode="numeric"
                            />
                        </div>

                        <div className="registration-input-group">
                            <label className="registration-input-label">연락 받을 이메일</label>
                            <input 
                                type="email" 
                                className="registration-text-input" 
                                placeholder="이메일을 입력해주세요" 
                                inputMode="email"
                            />
                        </div>

                        <button type="submit" className="registration-submit-btn">제출하기</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerRegistration;