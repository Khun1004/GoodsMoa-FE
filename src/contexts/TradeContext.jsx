import React, { createContext, useState } from "react";

export const TradeContext = createContext();

export const TradeProvider = ({ children }) => {
  const [formTradeData, setFormTradeData] = useState({
    title: "",
    categoryId: "",
    content: "",
    tags: [],
    description: [],
    price: "",
    condition: "중고",
    shipping: "사용",
    directTrade: "직거래",
    directTradeLocation: "",
    representativeImage: null,
    detailImages: [],
    contentImageFiles: [],
    representativeImageFile: null,
    detailImageFiles: [],
    deleteProductImageIds: [],
    imageUrl: [],
    userId: null
  });

  return (
    <TradeContext.Provider value={{ formTradeData, setFormTradeData }}>
      {children}
    </TradeContext.Provider>
  );
};
