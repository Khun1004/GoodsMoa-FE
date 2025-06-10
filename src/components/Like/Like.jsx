import React, { useEffect, useState } from 'react';
import './Like.css';

const Like = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
    setSelectedProducts(savedProducts.map(product => ({ ...product, quantity: 1 }))); // 초기 수량 1
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, quantity: newQuantity } : product
      )
    );
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    
    // localStorage에서도 제거
    const savedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
    const updatedProducts = savedProducts.filter(product => product.id !== id);
    localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
  };

  return (
    <div className="like-page">
      <h1 className='like-title'>좋아요 내역</h1>
      {selectedProducts.length > 0 ? (
        <div className="selected-products">
          {selectedProducts.map((product) => (
            <div key={product.id} className="selected-product-card">
              <div className="product-image-container">
                <img src={product.src} alt={product.name} className="selected-product-image" />
              </div>
              <div className='product-details'>
                <p className="selected-product-name">{product.name}</p>
                <p className="popup-price">{product.price || '가격 정보 없음'}원</p>
                <div className="quantity-selector">
                  <label htmlFor={`quantity-${product.id}`}>수량: </label>
                  <input
                    id={`quantity-${product.id}`}
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                    min="1"
                  />
                </div>
                <button 
                  className="remove-button" 
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">선택된 제품이 없습니다.</p>
      )}
    </div>
  );
};

export default Like;