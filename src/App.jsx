import AOS from "aos";
import "aos/dist/aos.css";
import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { LoginContext } from "./contexts/LoginContext";

import Category from "./components/public/Category/Category";
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
import HomeDemandList from "./components/Demands/HomeDemandList/HomeDemandList"
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import Like from "./components/Like/Like";
import Loading from "./components/Loading/Loading";
import OAuthRedirect from "./components/LoginOAuth/OAuthRedirect";
import MainDemand from "./components/MainDemand/MainDemand";
import MainSale from "./components/MainSale/MainSale";
import MainTrade from "./components/MainTrade/MainTrade";
import Modal from "./components/Modal/Modal";
import MyPage from "./components/MyPage/MyPage/MyPage";
import MyInformation from "./components/MyPage/MyPageSection/MyInformation/MyInformation";
import Navbar from "./components/Navbar/Navbar";
import Notice from "./components/Notice/Notice";
import OrderPage from "./components/OrderPage/OrderPage";
import Paint from "./components/Paint/Paint";
import ReportForm from "./components/ReportForm/ReportForm";
import MyOrders from "./components/Sales/MyOrders/MyOrders";
import Sale from "./components/Sales/Sale/Sale";
import SaleDetail from "./components/Sales/SaleDetail/SaleDetail";
import SaleForm from "./components/Sales/SaleForm/SaleForm";
import SalePurchaseCheck from "./components/Sales/SalePurchaseCheck/SalePurchaseCheck";
import SalePurchaseModal from "./components/Sales/SalePurchaseModal/SalePurchaseModal";
import SalePurchasePerfect from "./components/Sales/SalePurchasePerfect/SalePurchasePerfect";
import SaleWrite from "./components/Sales/SaleWrite/SaleWrite";
import Search from "./components/Search/Search";
import SearchResults from './components/SearchResults/SearchResults'; // 경로는 맞게 수정하세요
import Trade from "./components/Trade/Trade/Trade";
import TradeBuy from "./components/Trade/TradeBuy/TradeBuy";
import TradeBuyPerfect from "./components/Trade/TradeBuyPerfect/TradeBuyPerfect";
import TradeDetail from "./components/Trade/TradeDetail/TradeDetail";
import TradeForm from "./components/Trade/TradeForm/TradeForm";
import TradeWrite from "./components/Trade/TradeWrite/TradeWrite";
import { TradeProvider } from "./contexts/TradeContext";
import TossRedirectHandler from "./components/Trade/TossRedirectHandler";

const AppContent = ({
                        handleOrderPopup,
                        orderPopup,
                        openModal,
                        closeModal,
                        isLoggedIn,
                        mainCategory,
                        setMainCategory
                    }) => {
    const location = useLocation();
    const isChatPage =
        location.pathname === "/chat-app" || location.pathname === "/chat-other";
    const { isLogin, isLoading } = useContext(LoginContext);
    if (isLoading) return <Loading />; // ✅ 렌더링 지연 처리
    const [page, setPage] = useState(0);

    return (
        <TradeProvider>
        <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
            {!isChatPage && location.pathname !== "/Search" && (
                <Navbar
                    handleOrderPopup={handleOrderPopup}
                    openModal={openModal}
                    isLoggedIn={isLogin}
                />
            )}
            {!isChatPage && <Chatting />}
            {!isChatPage && <Notice />}
      {/* Routes */}
      <Routes>
        {/* Main Page */}
        <Route
          path="/"
          element={
              <div className="pt-[120px]">
                  <Hero handleOrderPopup={handleOrderPopup}/>

                  <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                      <div style={{maxWidth: "1430px", width: "100%"}}>
                          <Category
                              gap={60}
                              selectedId={mainCategory}
                              onCategoryClick={(id) => {
                                  setMainCategory(id);
                                  setPage(0);
                              }}
                          />
                          <hr className="sale-divider"/>
                      </div>

                  </div>

                  {/* <Products /> */}
                  <MainSale mainCategory={mainCategory} setMainCategory={setMainCategory} />
                  <MainTrade mainCategory={mainCategory} setMainCategory={setMainCategory} />
                  <MainDemand mainCategory={mainCategory} setMainCategory={setMainCategory} />
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
              path="/tradeDetail/:id"
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
              path="/HomeDemandList"
              element={
                  <div className="pt-[130px]">
                      <HomeDemandList />
                  </div>
              }
          />

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

         Sale Page
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

      {/* SalePurchaseSuccess (결제 성공 후 Toss 리디렉션) */}
      {/*<Route*/}
      {/*    path="/payment/success"*/}
      {/*    element={*/}
      {/*        <div className="pt-[130px]">*/}
      {/*            <PaymentSuccess />*/}
      {/*        </div>*/}
      {/*    }*/}
      {/*/>*/}

      {/* SalePurchaseCheck Page */}
      <Route path="/salePurchasePerfect"
        element={
          <div className="pt-[130px]">
            <SalePurchasePerfect />
          </div>
        }
      />

      {/* SalePurchaseCheck Page */}
      <Route path="/my-orders"
        element={
          <div className="pt-[130px]">
            <MyOrders />
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
                      <Modal /> {/* 더 이상 setUser, setIsLoggedIn 필요 없음 */}
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

      {/* Search Results Page */}
      <Route
          path="/search/results"
          element={
              <div className="pt-[30px]">
                  <SearchResults />
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

      <Route path="/tradeBuy" element={<TradeBuy />} />
      <Route path="/tradeBuy/success" element={<TossRedirectHandler />} />
      <Route path="/payment/success" element={<TossRedirectHandler />} />
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
     </TradeProvider>
  );
};

const App = () => {
    const { isLogin: isLoggedIn, isLoading } = useContext(LoginContext);
    const [orderPopup, setOrderPopup] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");

    useEffect(() => {
        AOS.init({
            offset: 100,
            duration: 800,
            easing: "ease-in-sine",
            delay: 100,
        });
        AOS.refresh();
    }, []);

    const [mainCategory, setMainCategory] = useState(0);
    const handleOrderPopup = () => setOrderPopup(!orderPopup);
    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent("");
    };

    if (isLoading) return <Loading />;

    return (
        <AppContent
            handleOrderPopup={handleOrderPopup}
            orderPopup={orderPopup}
            openModal={openModal}
            closeModal={closeModal}
            isLoggedIn={isLoggedIn}
            mainCategory={mainCategory}
            setMainCategory={setMainCategory}
        />
    );
};

export default App;
