import { faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import './EditAddress.css';

const EditAddress = ({ setEditingAddress, selectedAddress, shippingAddresses, setShippingAddresses, selectedAddressIndex }) => {
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [userDetailAddress, setUserDetailAddress] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // Load the selected address data when component mounts
    useEffect(() => {
        if (selectedAddress) {
            setRecipientName(selectedAddress.recipientName || '');
            setRecipientPhone(selectedAddress.recipientPhone || '');
            setUserAddress(selectedAddress.address || '');
            setUserDetailAddress(selectedAddress.detailAddress || '');
            setIsDefault(selectedAddress.isDefault || false);
        }
    }, [selectedAddress]);

    const handleSave = () => {
        // Validate inputs
        if (
            recipientName.trim() === "" ||
            recipientPhone.trim() === "" ||
            userAddress.trim() === ""
        ) {
            alert("수령인, 전화번호, 주소는 필수 입력 항목입니다.");
            return;
        }

        // Create updated address object
        const updatedAddress = {
            recipientName,
            recipientPhone,
            address: userAddress,
            detailAddress: userDetailAddress,
            isDefault
        };

        // Create a copy of the addresses array
        const updatedAddresses = [...shippingAddresses];

        // If setting as default, update all other addresses
        if (isDefault) {
            updatedAddresses.forEach((addr, idx) => {
                if (idx !== selectedAddressIndex) {
                    addr.isDefault = false;
                }
            });
        }

        // Update the selected address
        updatedAddresses[selectedAddressIndex] = updatedAddress;

        // If no address is set as default, set the first one as default
        if (!updatedAddresses.some(addr => addr.isDefault)) {
            updatedAddresses[0].isDefault = true;
        }

        // Update the state in parent component
        setShippingAddresses(updatedAddresses);
        
        // Save to localStorage
        localStorage.setItem("shippingAddresses", JSON.stringify(updatedAddresses));
        
        // Close the edit form
        setEditingAddress(false);
    };

    const handleAddressSearch = () => {
        // Load Daum postcode script if not already loaded
        if (!window.daum || !window.daum.Postcode) {
            const script = document.createElement('script');
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.onload = () => {
                executeDaumPostcode();
            };
            document.head.appendChild(script);
        } else {
            executeDaumPostcode();
        }
    };

    const executeDaumPostcode = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                const fullAddress = data.address;
                const extraAddress = data.addressType === 'R' ? 
                    (data.bname !== '' ? data.bname : '') + 
                    (data.buildingName !== '' ? (data.bname !== '' ? ', ' + data.buildingName : data.buildingName) : '') : '';
                
                setUserAddress(fullAddress + (extraAddress !== '' ? ` (${extraAddress})` : ''));
                
                // Focus on detail address input
                document.querySelector('input[placeholder="상세주소를 입력해 주세요"]').focus();
            }
        }).open();
    };

    return (
        <div className='container'>
            <div className="editAddress">
                <div className="editAddress-main">
                    <h1 className="manage-del">배송지 수정</h1>
                    <div className="editAddress-item">
                        <div className="editAddress-group">
                            <label className="editAddress-label">
                                <span>*</span>수령인
                            </label>
                            <input
                                type="text"
                                className="editAddress-value"
                                placeholder="수령인을 입력해 주세요"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                            />
                        </div>
                        <div className="editAddress-group">
                            <label className="editAddress-label">
                                <span>*</span>전화번호
                            </label>
                            <input
                                type="text"
                                className="editAddress-value"
                                placeholder="전화번호를 입력해 주세요"
                                value={recipientPhone}
                                onChange={(e) => setRecipientPhone(e.target.value)}
                            />
                        </div>
                        <div className="editAddress-group">
                            <label className="editAddress-label">
                                <span>*</span>주소
                            </label>
                            <div className="address-search-wrapper">
                                <input
                                    type="text"
                                    className="editAddress-value"
                                    placeholder="주소를 입력해 주세요"
                                    value={userAddress}
                                    readOnly
                                />
                                <button className="search-address-btn" onClick={handleAddressSearch}>
                                    주소 검색
                                </button>
                            </div>
                        </div>
                        <div className="editAddress-group">
                            <label className="editAddress-label">상세주소</label>
                            <input
                                type="text"
                                className="editAddress-value"
                                placeholder="상세주소를 입력해 주세요"
                                value={userDetailAddress}
                                onChange={(e) => setUserDetailAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="default-address" onClick={() => setIsDefault(!isDefault)}>
                        <FontAwesomeIcon 
                            icon={isDefault ? faCheckCircle : faCircle} 
                            className="check-icon" 
                        />
                        기본 배송지로 선택
                    </div>

                    <div className="update-container">
                        <button className="save" onClick={handleSave}>저장하기</button>
                        <button className="cancel" onClick={() => setEditingAddress(false)}>취소하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAddress;