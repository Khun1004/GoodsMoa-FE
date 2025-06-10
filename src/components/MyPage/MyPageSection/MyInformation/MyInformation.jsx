import React, { useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "../../../../contexts/LoginContext";
import EditAddress from "../../../EditAddress/EditAddress";
import "./MyInformation.css";

function MyInformation() {
    const { userInfo } = useContext(LoginContext);
    const hiddenFileInput = useRef(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    const handleEditAddress = () => {
        setIsEditingAddress(true);
    };

    const handleAddAddress = () => {
        setIsAddingAddress(true);
    };

    // Daum 주소검색 스크립트 로드 함수
    const loadDaumPostcodeScript = (callback) => {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = callback;
        document.head.appendChild(script);
    };

    // 주소 검색 팝업 열기
    const openAddressSearch = () => {
        // 스크립트가 이미 로드되었는지 확인
        if (window.daum && window.daum.Postcode) {
            executeDaumPostcode();
        } else {
            loadDaumPostcodeScript(() => {
                executeDaumPostcode();
            });
        }
    };

    // Daum 주소검색 실행
    const executeDaumPostcode = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                // 선택한 주소 데이터를 state에 업데이트
                const fullAddress = data.address;
                const extraAddress = data.addressType === 'R' ? 
                    (data.bname !== '' ? data.bname : '') + 
                    (data.buildingName !== '' ? (data.bname !== '' ? ', ' + data.buildingName : data.buildingName) : '') : '';
                
                setNewAddress(prev => ({
                    ...prev,
                    address: fullAddress + (extraAddress !== '' ? ` (${extraAddress})` : '')
                }));
                
                // 상세주소 입력 필드에 포커스
                document.querySelector('input[placeholder="상세주소"]')?.focus();
            }
        }).open();
    };

    const handleSave = () => {
        if (
            image &&
            userName.trim() !== "" &&
            nickName.trim() !== "" &&
            description.trim() !== "" &&
            userEmail.trim() !== "" &&
            userPassword.trim() !== "" &&
            userPhone.trim() !== "" &&
            accountHolder.trim() !== "" &&
            bankName.trim() !== "" &&
            accountNumber.trim() !== "" &&
            userAddress.trim() !== "" &&
            userDetailAddress.trim() !== "" &&
            recipientName.trim() !== "" &&
            recipientPhone.trim() !== ""
        ) {
            // 모든 조건 만족 시 데이터 저장
            localStorage.setItem("profileImage", image);
            localStorage.setItem("profileName", userName);
            localStorage.setItem("profileNickName", nickName);
            localStorage.setItem("profileDescription", description);
            localStorage.setItem("userEmail", userEmail);
            localStorage.setItem("userPassword", userPassword);
            localStorage.setItem("userPhone", userPhone);
            localStorage.setItem("accountHolder", accountHolder);
            localStorage.setItem("bankName", bankName);
            localStorage.setItem("accountNumber", accountNumber);
            localStorage.setItem("userAddress", userAddress);
            localStorage.setItem("userDetailAddress", userDetailAddress);
            localStorage.setItem("recipientName", recipientName);
            localStorage.setItem("recipientPhone", recipientPhone);
            localStorage.setItem("ordererName", nickName);

            // 배송지 목록 저장
            localStorage.setItem("shippingAddresses", JSON.stringify(shippingAddresses));

            setVerified(true);
            alert("본인 인증이 완료되었습니다!");
        } else {
            alert("사진과 모든 정보를 작성해야 본인 인증이 완료됩니다.");
            setVerified(false);
        }
    };

    // Load initial state from localStorage
    const [image, setImage] = useState(() => localStorage.getItem("profileImage"));
    const [userName, setUserName] = useState(() => localStorage.getItem("profileName") || "프로필");
    const [description, setDescription] = useState(() =>
        localStorage.getItem("profileDescription") ||
        "구매자에게 보여주는 자기소개 자리 입니다. \n구매자들이 자기소개를 보고 판매자가 어떤 물건을 파는지 파악하는 용도 입니다."
    );
    const [verified, setVerified] = useState(() => {
        const storedImage = localStorage.getItem("profileImage");
        const storedName = localStorage.getItem("profileName");
        const storedDescription = localStorage.getItem("profileDescription");
        return !!(storedImage && storedName && storedDescription);
    });

    const [userEmail, setUserEmail] = useState(userInfo?.email || "");
    const [userPassword, setUserPassword] = useState("");
    const [nickName, setNickName] = useState(userInfo?.nickname || "");
    const [userPhone, setUserPhone] = useState(userInfo?.phoneNumber || "");

    // Account details state
    const [accountHolder, setAccountHolder] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    // Shipping address state
    const [userAddress, setUserAddress] = useState("");
    const [userDetailAddress, setUserDetailAddress] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");

    // State to track if the password field is focused or clicked
    const [passwordFocused, setPasswordFocused] = useState(false);

    // 배송지 목록 상태
    const [shippingAddresses, setShippingAddresses] = useState(() => {
        const savedAddresses = localStorage.getItem("shippingAddresses");
        if (savedAddresses) {
            return JSON.parse(savedAddresses);
        }
        // 기본 배송지 초기화
        return [{
            isDefault: true,
            recipientName: "",
            recipientPhone: "",
            address: "",
            detailAddress: ""
        }];
    });

    // 선택된 배송지 상태
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

    // 새 배송지 상태
    const [newAddress, setNewAddress] = useState({
        recipientName: "",
        recipientPhone: "",
        address: "",
        detailAddress: "",
        isDefault: false
    });

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result;
                setImage(newImage);
                localStorage.setItem("profileImage", newImage);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setImage(null);
        localStorage.removeItem("profileImage");
    };

    const handleClick = () => {
        hiddenFileInput.current.click();
    };

    const handleUserNameChange = (event) => {
        const newName = event.target.value;
        setUserName(newName);
        localStorage.setItem("profileName", newName);
    };

    // 새 배송지 데이터 핸들러
    const handleNewAddressChange = (field, value) => {
        setNewAddress(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 새 배송지 저장
    const saveNewAddress = () => {
        if (
            newAddress.recipientName.trim() === "" ||
            newAddress.recipientPhone.trim() === "" ||
            newAddress.address.trim() === "" ||
            newAddress.detailAddress.trim() === ""
        ) {
            alert("모든 배송지 정보를 입력해주세요.");
            return;
        }

        const updatedAddresses = [...shippingAddresses];
        
        // 기본 배송지로 설정한 경우 다른 주소의 기본 설정 해제
        if (newAddress.isDefault) {
            updatedAddresses.forEach(addr => {
                addr.isDefault = false;
            });
        }
        
        // 기존 배송지가 없고 처음 추가하는 경우 기본 배송지로 설정
        if (updatedAddresses.length === 0 || (updatedAddresses.length === 1 && !updatedAddresses[0].recipientName)) {
            newAddress.isDefault = true;
        }
        
        // 첫 배송지인 경우 (빈 더미 데이터)
        if (updatedAddresses.length === 1 && !updatedAddresses[0].recipientName) {
            updatedAddresses[0] = newAddress;
        } else {
            updatedAddresses.push(newAddress);
        }
        
        setShippingAddresses(updatedAddresses);
        localStorage.setItem("shippingAddresses", JSON.stringify(updatedAddresses));
        
        // 새로 추가된 배송지의 인덱스로 선택 변경
        const newIndex = updatedAddresses.length - 1;
        setSelectedAddressIndex(newIndex);
        
        // 기본 배송지면 메인 폼에도 정보 설정
        if (newAddress.isDefault) {
            setRecipientName(newAddress.recipientName);
            setRecipientPhone(newAddress.recipientPhone);
            setUserAddress(newAddress.address);
            setUserDetailAddress(newAddress.detailAddress);
        }
        
        // 새 배송지 폼 초기화 및 닫기
        setNewAddress({
            recipientName: "",
            recipientPhone: "",
            address: "",
            detailAddress: "",
            isDefault: false
        });
        setIsAddingAddress(false);
    };

    // 배송지 선택 시 호출되는 함수
    const selectAddress = (index) => {
        setSelectedAddressIndex(index);
        const selected = shippingAddresses[index];
        
        // 선택된 배송지 정보를 메인 폼에 설정
        setRecipientName(selected.recipientName);
        setRecipientPhone(selected.recipientPhone);
        setUserAddress(selected.address);
        setUserDetailAddress(selected.detailAddress);
    };

    // 배송지를 기본 배송지로 설정
    const setAsDefault = (index) => {
        const updatedAddresses = shippingAddresses.map((addr, idx) => ({
            ...addr,
            isDefault: idx === index
        }));
        
        setShippingAddresses(updatedAddresses);
        localStorage.setItem("shippingAddresses", JSON.stringify(updatedAddresses));
    };

    // 배송지 삭제
    const deleteAddress = (index) => {
        if (shippingAddresses.length === 1) {
            alert("최소 한 개의 배송지는 유지해야 합니다.");
            return;
        }
        
        const updatedAddresses = [...shippingAddresses];
        const wasDefault = updatedAddresses[index].isDefault;
        
        updatedAddresses.splice(index, 1);
        
        // 삭제한 주소가 기본 배송지였다면 첫번째 주소를 기본으로 설정
        if (wasDefault && updatedAddresses.length > 0) {
            updatedAddresses[0].isDefault = true;
        }
        
        setShippingAddresses(updatedAddresses);
        localStorage.setItem("shippingAddresses", JSON.stringify(updatedAddresses));
        
        // 삭제 후 선택된 인덱스 조정
        if (selectedAddressIndex >= updatedAddresses.length) {
            setSelectedAddressIndex(updatedAddresses.length - 1);
        }
        
        // 현재 폼에 표시되는 배송지 정보 업데이트
        if (updatedAddresses.length > 0) {
            const newSelected = updatedAddresses[selectedAddressIndex < updatedAddresses.length ? selectedAddressIndex : 0];
            setRecipientName(newSelected.recipientName);
            setRecipientPhone(newSelected.recipientPhone);
            setUserAddress(newSelected.address);
            setUserDetailAddress(newSelected.detailAddress);
        }
    };

    // 메인 폼의 주소검색 실행
    const executeMainDaumPostcode = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                const fullAddress = data.address;
                const extraAddress = data.addressType === 'R' ? 
                    (data.bname !== '' ? data.bname : '') + 
                    (data.buildingName !== '' ? (data.bname !== '' ? ', ' + data.buildingName : data.buildingName) : '') : '';
                
                setUserAddress(fullAddress + (extraAddress !== '' ? ` (${extraAddress})` : ''));
                
                // 상세주소 입력 필드에 포커스
                document.querySelector('input[placeholder="상세주소"]')?.focus();
            }
        }).open();
    };

    useEffect(() => {
        // 배송지 데이터 초기화
        if (shippingAddresses.length > 0) {
            const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
            if (defaultAddress.recipientName) {
                setRecipientName(defaultAddress.recipientName);
                setRecipientPhone(defaultAddress.recipientPhone);
                setUserAddress(defaultAddress.address);
                setUserDetailAddress(defaultAddress.detailAddress);
            }
        }
    }, []);

    return (
        <div className="mypage-container">
            {isEditingAddress ? (
                <EditAddress 
                    setEditingAddress={setIsEditingAddress} 
                    selectedAddress={shippingAddresses[selectedAddressIndex]}
                    shippingAddresses={shippingAddresses}
                    setShippingAddresses={setShippingAddresses}
                    selectedAddressIndex={selectedAddressIndex}
                />
            ) : isAddingAddress ? (
                <div className="add-address-container">
                    <h2>새 배송지 추가</h2>
                    <div className="new-address-form">
                        <div className="info-item">
                            <span className="info-label">수령인</span>
                            <input
                                placeholder="수령인 이름"
                                className="info-value"
                                type="text"
                                value={newAddress.recipientName}
                                onChange={(e) => handleNewAddressChange("recipientName", e.target.value)}
                            />
                        </div>
                        <div className="info-item">
                            <span className="info-label">전화번호</span>
                            <input
                                placeholder="전화번호"
                                className="info-value"
                                type="text"
                                value={newAddress.recipientPhone}
                                onChange={(e) => handleNewAddressChange("recipientPhone", e.target.value)}
                            />
                        </div>
                        <div className="info-item address-search-row">
                            <span className="info-label">주소</span>
                            <div className="address-input-group">
                                <input
                                    placeholder="주소"
                                    className="info-value address-input"
                                    type="text"
                                    value={newAddress.address}
                                    onChange={(e) => handleNewAddressChange("address", e.target.value)}
                                    readOnly
                                />
                                <button 
                                    type="button" 
                                    className="address-search-btn"
                                    onClick={openAddressSearch}
                                >
                                    주소 검색
                                </button>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-label">상세주소</span>
                            <input
                                placeholder="상세주소"
                                className="info-value"
                                type="text"
                                value={newAddress.detailAddress}
                                onChange={(e) => handleNewAddressChange("detailAddress", e.target.value)}
                            />
                        </div>
                        <div className="default-address-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newAddress.isDefault}
                                    onChange={(e) => handleNewAddressChange("isDefault", e.target.checked)}
                                />
                                기본 배송지로 설정
                            </label>
                        </div>
                    </div>
                    <div className="address-buttons">
                        <button className="save-address" onClick={saveNewAddress}>저장하기</button>
                        <button className="cancel-address" onClick={() => setIsAddingAddress(false)}>취소하기</button>
                    </div>
                </div>
            ) : (
            <div>
                <div className="profile-header">
                    <h1 className="userProfile">유저 프로필</h1>
                    <div className="verification">
                        <span>본인 인증 완료</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={verified}
                                readOnly
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="profile-section">
                        <div className="profile-picture">
                            {image ? (
                                <div className="image-wrapper">
                                    <img src={image} alt="Profile" className="profile-image" />
                                    <div className="overlay">
                                        <button className="overlay-button" onClick={handleClick}>
                                            사진 변경
                                        </button>
                                        <button className="overlay-button" onClick={handleDeleteImage}>
                                            사진 삭제
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="placeholder-image" onClick={handleClick}>
                                    사진 추가
                                </div>
                            )}
                            <input
                                type="file"
                                ref={hiddenFileInput}
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                            />
                        </div>
                        <input
                            type="text"
                            value={userName}
                            onChange={handleUserNameChange}
                            className="user-name-input"
                        />
                    </div>

                    <div className="info-section">
                        <div className="info-item">
                            <span className="info-label">이름</span>
                            <input
                                placeholder="유저 이름"
                                className="info-value"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                        <div className="info-item">
                            <span className="info-label">닉네임</span>
                            <input
                                placeholder="닉네임"
                                className="info-value"
                                type="text"
                                value={nickName}
                                onChange={(e) => setNickName(e.target.value)}
                            />
                        </div>
                        <div className="info-item">
                            <span className="info-label">이메일</span>
                            <input
                                placeholder="유저 이메일"
                                className="info-value"
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="info-item">
                            <span className="info-label">비밀번호</span>
                            <input
                                placeholder="유저 비밀번호"
                                className="info-value"
                                type="password"
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                        </div>
                        {passwordFocused && (
                            <p className="info-note">
                                * 소셜 로그인 시 비밀번호는 해당 소셜 비밀번호입니다.
                            </p>
                        )}
                        <div className="info-item">
                            <span className="info-label">전화번호</span>
                            <input
                                placeholder="유저 전화번호"
                                className="info-value"
                                type="text"
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 계좌 */}
                <div className="account-main">
                    <h1 className="account">계좌</h1>
                    <div className="account-section">
                        <div className="info-item">
                            <span className="info-label">예금주</span>
                            <input
                                placeholder="예금 주명"
                                className="info-value"
                                type="text"
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                            />
                        </div>
                        <div className="info-item">
                            <span className="info-label">은행</span>
                            <select
                                id="bank-select"
                                className="info-value"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                            >
                                <option value="" disabled>은행명을 선택해 주세요</option>
                                <option value="004">KB국민은행</option>
                                <option value="020">우리은행</option>
                                <option value="088">신한은행</option>
                                <option value="011">NH농협은행</option>
                                <option value="089">케이뱅크</option>
                                <option value="090">카카오뱅크</option>
                                <option value="092">토스뱅크</option>
                                <option value="090_2">카카오뱅크(미성년자)</option>
                                <option value="092_2">토스뱅크(미성년자)</option>
                                <option value="003">IBK기업은행</option>
                                <option value="023">SC제일은행</option>
                                <option value="027">씨티은행</option>
                                <option value="031">대구은행</option>
                                <option value="032">부산은행</option>
                                <option value="034">광주은행</option>
                                <option value="035">제주은행</option>
                                <option value="037">전북은행</option>
                                <option value="039">경남은행</option>
                                <option value="045">새마을금고</option>
                                <option value="048">신협은행</option>
                                <option value="071">우체국</option>
                                <option value="081">하나은행</option>
                                <option value="007">수협</option>
                                <option value="002">KDB산업</option>
                                <option value="054">홍콩상하이은행</option>
                                <option value="209">유안타증권</option>
                                <option value="218">KB증권</option>
                                <option value="238">미래에셋증권</option>
                                <option value="240">삼성증권</option>
                                <option value="243">한국투자증권</option>
                                <option value="247">NH투자증권</option>
                                <option value="262">아이엠증권</option>
                                <option value="263">현대차증권</option>
                                <option value="266">SK증권</option>
                                <option value="267">대신증권</option>
                                <option value="269">한화투자증권</option>
                                <option value="270">하나금융투자</option>
                                <option value="278">신한금융투자</option>
                                <option value="279">DB금융투자</option>
                                <option value="280">유진투자증권</option>
                                <option value="287">메리츠증권</option>
                                <option value="291">신영증권</option>
                            </select>
                        </div>
                        <div className="info-item">
                            <span className="info-label">계좌 번호</span>
                            <input
                                placeholder="해당 계좌 번호"
                                className="info-value"
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 배송지 관리 */}
                <div className="shipping-main">
                    <h1 className="myInfoManage-del">배송지 관리</h1>

                    {/* 배송지 목록 */}
                    {shippingAddresses.length > 0 && shippingAddresses.some(addr => addr.recipientName) && (
                        <div className="address-list">
                            {shippingAddresses.map((address, index) => (
                                <div 
                                    key={index} 
                                    className={`address-item ${selectedAddressIndex === index ? 'selected' : ''}`}
                                    onClick={() => selectAddress(index)}
                                >
                                    <div className="address-header">
                                        <div className="address-name">
                                            {address.recipientName} {address.isDefault && <span className="default-badge">기본</span>}
                                        </div>
                                        <div className="address-actions">
                                            {!address.isDefault && (
                                                <button onClick={(e) => { e.stopPropagation(); setAsDefault(index); }}>
                                                    기본으로 설정
                                                </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); deleteAddress(index); }}>
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                    <div className="address-details">
                                        <div>🏠 {address.address}</div>
                                        <div>📍 {address.detailAddress}</div>
                                        <div>📞 {address.recipientPhone}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="manage-bacground">
                        <div className="shipping-buttons">
                            <button className="default-shipping">기본 배송지</button>
                            <button className="edit-shipping" onClick={handleEditAddress}>수정하기</button>
                        </div>
                        <div className="shipping-item">
                            <div className="shipping-container">
                                <div className="shipping-group">
                                    <span className="shipping-label">수령인</span>
                                    <input
                                        placeholder="수령인 이름"
                                        className="shipping-value"
                                        type="text"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        readOnly
                                    />
                                </div>
                                <div className="shipping-group address-search-row">
                                    <span className="shipping-label">주소</span>
                                    <div className="address-input-group">
                                        <input
                                            placeholder="주소"
                                            className="shipping-value address-input"
                                            type="text"
                                            value={userAddress}
                                            onChange={(e) => setUserAddress(e.target.value)}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="shipping-container">
                                <div className="shipping-group">
                                    <span className="shipping-label">전화번호</span>
                                    <input
                                        placeholder="전화번호"
                                        className="shipping-value"
                                        type="text"
                                        value={recipientPhone}
                                        onChange={(e) => setRecipientPhone(e.target.value)}
                                        readOnly
                                    />
                                </div>
                                <div className="shipping-group">
                                    <span className="shipping-label">상세주소</span>
                                    <input
                                        placeholder="상세주소"
                                        className="shipping-value"
                                        type="text"
                                        value={userDetailAddress}
                                        onChange={(e) => setUserDetailAddress(e.target.value)}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="addOthers" onClick={handleAddAddress}>배송지 추가하기</button>
                </div>

                <div className="update-container">
                    <button className="myInfoSave" onClick={handleSave}>저장하기</button>
                    <button className="myInfoCancel">취소하기</button>
                </div>
            </div>
        )}
    </div>
    );
}

export default MyInformation;