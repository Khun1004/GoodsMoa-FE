// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import LoginContextProvider from "./contexts/LoginContext"; // 경로 맞게 조정

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
/*  <StrictMode>*/
    <BrowserRouter> {/* ✅ Router 가장 바깥 */}
      <LoginContextProvider> {/* ✅ 로그인 컨텍스트 적용 */}
        <App />
      </LoginContextProvider>
    </BrowserRouter>
 /* </StrictMode>*/
);
