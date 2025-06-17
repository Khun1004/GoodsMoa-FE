import AOS from "aos";
import "aos/dist/aos.css";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Category from "./components/Category/Category";
import ChatApp from "./components/ChatApp/ChatApp";
import ChatOther from "./components/ChatOther/ChatOther";
import Chatting from "./components/Chatting/Chatting";
import Commission from "./components/Commissions/Commission/Commission";
import CommissionApplyWrite from "./components/Commissions/CommissionApplyWrite/CommissionApplyWrite";
import CommissionDetail from "./components/Commissions/CommissionDetail/CommissionDetail";
import CommissionForm from "./components/Commissions/CommissionForm/CommissionForm";
import CommissionPerfect from "./components/Commissions/CommissionPerfect/CommissionPerfect";
import CommissionWrite from "./components/Commissions/CommissionWrite/CommissionWrite";
import Community from "./components/Communities/Community/Community";
import CommunityForm from "./components/Communities/CommunityForm/CommunityForm";
import Demand from "./components/Demands/Demand/Demand";
import DemandBuy from "./components/Demands/DemandBuy/DemandBuy";
import DemandBuyPerfect from "./components/Demands/DemandBuyPerfect/DemandBuyPerfect";
import DemandDetail from "./components/Demands/DemandDetail/DemandDetail";
import DemandForm from "./components/Demands/DemandForm/DemandForm.jsx";
import DemandReportPage from "./components/Demands/DemandReportPage/DemandReportPage";
import DemandReportPerfect from "./components/Demands/DemandReportPerfect/DemandReportPerfect";
import DemandWrite from "./components/Demands/DemandWrite/DemandWrite";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import Like from "./components/Like/Like";
import OAuthRedirect from "./components/LoginOAuth/OAuthRedirect";
import MainSale from "./components/MainSale/MainSale";
import MainTrade from "./components/MainTrade/MainTrade";
import MainDemand from "./components/MainDemand/MainDemand";
import Modal from "./components/Modal/Modal";
import MyPage from "./components/MyPage/MyPage/MyPage";
import MyInformation from "./components/MyPage/MyPageSection/MyInformation/MyInformation";
import Navbar from "./components/Navbar/Navbar";
import Notice from "./components/Notice/Notice";
import OrderPage from "./components/OrderPage/OrderPage";
import Paint from "./components/Paint/Paint";
import Products from "./components/Products/Products";
import ReportForm from "./components/ReportForm/ReportForm";
import Sale from "./components/Sales/Sale/Sale";
import SaleDetail from "./components/Sales/SaleDetail/SaleDetail";
import SaleForm from "./components/Sales/SaleForm/SaleForm";
import SalePurchaseCheck from "./components/Sales/SalePurchaseCheck/SalePurchaseCheck";
import SalePurchaseModal from "./components/Sales/SalePurchaseModal/SalePurchaseModal";
import SaleWrite from "./components/Sales/SaleWrite/SaleWrite";
import Search from "./components/Search/Search";
import Trade from "./components/Trade/Trade/Trade";
import TradeBuy from "./components/Trade/TradeBuy/TradeBuy";
import TradeBuyPerfect from "./components/Trade/TradeBuyPerfect/TradeBuyPerfect";
import TradeDetail from "./components/Trade/TradeDetail/TradeDetail";
import TradeForm from "./components/Trade/TradeForm/TradeForm";
import TradeWrite from "./components/Trade/TradeWrite/TradeWrite";
import SalePurchasePerfect from "./components/Sales/SalePurchasePerfect/SalePurchasePerfect";

const AppContent = ({ handleOrderPopup, orderPopup, openModal, 
  closeModal, isLoggedIn, setIsLoggedIn, setUser }) => {
  const location = useLocation();

  // Check if the current page is the ChatApp page
  const isChatPage = location.pathname === "/chat-app" || location.pathname === "/chat-other";
  return (
    
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      {/* Navbar will be hidden on /chat-app */}
      {!isChatPage && location.pathname !== "/Search" && (
        <Navbar 
          handleOrderPopup={handleOrderPopup} 
          openModal={openModal} 
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn} 
        />
      )}

      {/* Chatting Component */}
      {!isChatPage && <Chatting />}
      {/* Notice Component */}
      {!isChatPage && <Notice />}

      {/* Routes */}
      <Routes>
        {/* Main Page */}
        <Route
          path="/"
          element={
            <div className="pt-[120px]">
              <Hero handleOrderPopup={handleOrderPopup} />
              <Category />
              {/* <Products /> */}
              <MainSale />
              <MainTrade />
              <MainDemand />
            </div>
          }
        />

        {/* Commission Page */}
        <Route
          path="/commission"
          element={
            <div className="pt-[130px]">
              <Commission />
            </div>
          }
        />

        {/* CommissionForm Page */}
        <Route
          path="/commissionForm"
          element={
            <div className="pt-[130px]">
              <CommissionForm />
            </div>
          }
        />

        {/* CommissionWrite Page */}
        <Route
          path="/commissionWrite"
          element={
            <div className="pt-[130px]">
              <CommissionWrite />
            </div>
          }
        />

        {/* CommissionDetail Page */}
        <Route
          path="/commissionDetail"
          element={
            <div className="pt-[130px]">
              <CommissionDetail />
            </div>
          }
        />

        {/* CommissionApplyWrite Page */}
        <Route
          path="/commissionApplyWrite"
          element={
            <div className="pt-[130px]">
              <CommissionApplyWrite />
            </div>
          }
        />

        {/* CommissionPerfect Page */}
        <Route
          path="/commissionPerfect"
          element={
            <div className="pt-[130px]">
              <CommissionPerfect />
            </div>
          }
        />

        {/* TradeForm Page */}
        <Route
          path="/tradeForm"
          element={
            <div className="pt-[130px]">
              <TradeForm />
            </div>
          }
        />

        {/* TradeDetail Page */}
        <Route
          path="/tradeDetail"
          element={
            <div className="pt-[130px]">
              <TradeDetail />
            </div>
          }
        />

        {/* Trade Page */}
        <Route
          path="/trade"
          element={
            <div className="pt-[130px]">
              <Trade />
            </div>
          }
        />

        {/* TradeWrite Page */}
        <Route
          path="/tradeWrite"
          element={
            <div className="pt-[130px]">
              <TradeWrite />
            </div>
          }
        />

        {/* TradeBuy Page */}
        <Route
          path="/tradePurchase"
          element={
            <div className="pt-[130px]">
              <TradeBuy />
            </div>
          }
        />

        {/* TradeBuyPerfect Page */}
        <Route
          path="/tradeBuyPerfect"
          element={
            <div className="pt-[80px]">
              <TradeBuyPerfect />
            </div>
          }
        />

        {/* Demand Page */}
        <Route
          path="/demand"
          element={
            <div className="pt-[130px]">
              <Demand />
            </div>
          }
        />

        {/* DemandForm Page */}
        <Route
          path="/demandForm"
          element={
            <div className="pt-[130px]">
              <DemandForm/>
            </div>
          }
        />

        {/* DemandWrite Page */}
        <Route
          path="/demandWrite"
          element={
            <div className="pt-[130px]">
              <DemandWrite/>
            </div>
          }
        />

        {/* DemandDetail Page */}
        <Route
          path="/demandDetail/:id"
          element={
            <div className="pt-[130px]">
              <DemandDetail/>
            </div>
          }
        />

        {/* DemandBuy Page */}
        <Route
          path="/demandDetailBuy"
          element={
            <div className="pt-[130px]">
              <DemandBuy/>
            </div>
          }
        />

        {/* DemandBuyPerfect Page */}
        <Route
          path="/demandBuyPerfect"
          element={
            <div className="pt-[130px]">
              <DemandBuyPerfect/>
            </div>
          }
        />

        {/* DemandReport Page */}
        <Route
          path="/demandReport"
          element={
            <div className="pt-[130px]">
              <DemandReportPage/>
            </div>
          }
        />

        {/* DemandReportPerfect Page */}
        <Route
          path="/demandReportPerfect"
          element={
            <div className="pt-[130px]">
              <DemandReportPerfect/>
            </div>
          }
        />

        {/* ReportForm Page */}
        <Route
          path="/report"
          element={
            <div className="pt-[130px]">
              <ReportForm />
            </div>
          }
        />

        {/* Sale Page */}
        <Route
          path="/sale"
          element={
            <div className="pt-[130px]">
              <Sale />
            </div>
          }
        />

        {/* SaleWrite Page */}
        <Route
          path="/write"
          element={
            <div className="pt-[130px]">
              <SaleWrite />
            </div>
          }
        />

        {/* SalePurchaseModal Page */}
        <Route path="/purchase" 
          element={
            <div className="pt-[130px]">
              <SalePurchaseModal />
            </div>
          }
        />

        {/* SaleForm Page */}
        <Route
          path="/saleForm"
          element={
            <div className="pt-[130px]">
              <SaleForm />
            </div>
          }
        />

        {/* SaleDetail Page */}
        <Route path="/person" 
          element={
            <div className="pt-[130px]">
              <SaleDetail />
            </div>
          }
        />

        {/* SalePurchaseCheck Page */}
        <Route path="/salePurchaseCheck" 
          element={
            <div className="pt-[130px]">
              <SalePurchaseCheck />
            </div>
          }
        />

        {/* SalePurchaseCheck Page */}
        <Route path="/salePurchasePerfect" 
          element={
            <div className="pt-[130px]">
              <SalePurchasePerfect />
            </div>
          }
        />

        {/* Community Page */}
        <Route path="/community" 
          element={
            <div className="pt-[130px]">
              <Community />
            </div>
          }
        />

        {/* CommunityForm Page */}
        <Route path="/communityForm" 
          element={
            <div className="pt-[130px]">
              <CommunityForm />
            </div>
          }
        />

        {/* Auth Pages */}
        <Route
          path="/auth"
          element={
            <div className="pt-[80px]">
              <Modal closeModal={closeModal} />
            </div>
          }
        />

      <Route path="/oauth/kakao" element={<OAuthRedirect />} />

        {/* Login Page */}
        <Route
          path="/Login"
          element={
            <div className="pt-[80px]">
              <Modal setUser={setUser} setIsLoggedIn={setIsLoggedIn} />
            </div>
          }
        />

        {/* Search Page */}
        <Route
          path="/Search"
          element={
            <div className="pt-[30px]">
              <Search />
            </div>
          }
        />

        {/* Paint Page */}
        <Route
          path="/paint"
          element={
            <div className="pt-[80px]">
              <Paint />
            </div>
          }
        />

        {/* My Page */}
        <Route
          path="/mypage"
          element={
            <div className="pt-[110px]">
              <MyPage />
            </div>
          }
        />

        {/* My Information */}
        <Route
          path="/myInformation"
          element={
            <div className="pt-[130px]">
              <MyInformation />
              <MyPage />
            </div>
          }
        />

        {/* Like Page */}
        <Route
          path="/likes"
          element={
            <div className="pt-[80px]">
              <Like />
              <MyPage />
            </div>
          }
        />

        {/* OrderPage Page */}
        <Route path="/order" element={
          <div className="pt-[130px]">
            <OrderPage />
          </div>} 
        />

        {/* ChatApp Page */}
        <Route path="/chat-app" element={<ChatApp />} />
        <Route path="/chat-other" element={<ChatOther />} />
      </Routes>

      {/* Footer will be hidden on /chat-app */}
      {!isChatPage && <Footer />}
    </div>
  );
};

const App = () => {
  const [orderPopup, setOrderPopup] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  const handleOrderPopup = () => setOrderPopup(!orderPopup);

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent("");
  };

  return (
    <AppContent
      handleOrderPopup={handleOrderPopup}
      orderPopup={orderPopup}
      openModal={openModal}
      closeModal={closeModal}
      isLoggedIn={isLoggedIn}
      setIsLoggedIn={setIsLoggedIn}
      setUser={setUser}
    />
  );
};

export default App;
