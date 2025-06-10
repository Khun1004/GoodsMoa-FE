import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./OrderPage.css";

const STORAGE_KEY = "wantedProducts";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 로컬 스토리지에서 초기값 가져오기
  const getStoredProducts = () => {
    const storedProducts = localStorage.getItem(STORAGE_KEY);
    return storedProducts ? JSON.parse(storedProducts) : [];
  };

  const [wantedProducts, setWantedProducts] = useState(getStoredProducts);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // 전달받은 shippingMethods와 saleLabel 가져오기
  const shippingMethods = location.state?.shippingMethods || [];
  const saleLabel = location.state?.saleLabel || "";

  // location.state에서 전달된 상품이 있으면 추가
  useEffect(() => {
    if (location.state?.wantedProducts) {
      setWantedProducts((prevWantedProducts) => {
        const updatedProducts = [
          ...prevWantedProducts,
          ...location.state.wantedProducts.filter(product => 
            !prevWantedProducts.some(existingProduct => existingProduct.id === product.id)
          ),
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
        return updatedProducts;
      });

      // 변경 사항을 감지하도록 storage 이벤트 트리거
      window.dispatchEvent(new Event("storage"));
    }
  }, [location.state]);

  // 상품이 변경될 때마다 localStorage 업데이트
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wantedProducts));
  }, [wantedProducts]);

  // 상품 선택/해제 함수
  const toggleSelectProduct = (productId) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  // 선택한 상품 삭제 함수
  const deleteSelectedProducts = () => {
    if (selectedProducts.length === 0) {
        alert('삭제할 상품을 선택해주세요.');
        return;
    }
    const updatedProducts = wantedProducts.filter(product => !selectedProducts.includes(product.id));
    setWantedProducts(updatedProducts);
    setSelectedProducts([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));

    // 변경 감지를 위해 storage 이벤트 발생
    window.dispatchEvent(new Event("storage"));

    alert('선택한 상품이 삭제되었습니다.');
  };

  // 선택한 상품 구매 함수
  const handlePurchase = () => {
    if (selectedProducts.length === 0) {
      alert('구매할 상품을 선택해주세요.');
      return;
    }
    const productsToPurchase = wantedProducts.filter(product => selectedProducts.includes(product.id));
    navigate('/purchase', { state: { wantedProducts: productsToPurchase, shippingMethods, saleLabel } });
  };

  return (
    <div className="container">
      <div className="popup-page">
        <h1 className="popupTitle">장바구니</h1>
        <div className='popup-products'>
          {wantedProducts.length > 0 ? (
            wantedProducts.map((product) => (
              <div key={product.id} className='popup-product'>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleSelectProduct(product.id)}
                  className="popup-checkbox"
                />
                <div className="popupimage-container">
                    <img src={product.image} alt={product.name} className="popup-image" />
                    <div className="popup-labelProduct">
                      {saleLabel} <span className="separator"> &gt; </span> {product.name} 
                      <span className="separator"> &gt; </span> {product.category || "미정"}
                    </div>
                </div>
                <div className="popup-info">
                  <p className="popup-name">{product.name}</p>
                  <p className="popup-price">{(product.price * product.quantity).toLocaleString()} 원</p>
                  <p className="popup-quantity">수량: {product.quantity}개</p>
                </div>
              </div>
            ))
          ) : (
            <p className='popup-product'>장바구니가 비어 있습니다.</p>
          )}
        </div>

        <div className='popup-details'>
          <div className='popup-details-name'>
              <ul>
                  <li>총 상품 갯수</li>
                  <li>배송비</li>
                  <li>총 상품 금액</li>
              </ul>
          </div>
          <div className='popup-details-price'>
            <ul>
                <li>{wantedProducts.reduce((total, product) => total + product.quantity, 0)} 개</li>
                <li>
                    {shippingMethods?.some(method => method.cost > 0) ? (
                        shippingMethods.reduce((totalCost, method) => totalCost + (Number(method.cost) || 0), 0).toLocaleString() + " 원"
                    ) : (
                        "무료배송"
                    )}
                </li>
                <li>
                    {(
                        wantedProducts.reduce((total, product) => total + product.price * product.quantity, 0) +
                        (shippingMethods?.reduce((totalCost, method) => totalCost + (Number(method.cost) || 0), 0) || 0)
                    ).toLocaleString()} 원
                </li>
            </ul>
          </div>
        </div>

        <div className="button-container">
          <button
            className="delete-products"
            onClick={deleteSelectedProducts}
            disabled={selectedProducts.length === 0}
          >
            상품 삭제
          </button>
          <button
            className="pay"
            onClick={handlePurchase}
            disabled={selectedProducts.length === 0}
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
