import React, { createContext, useEffect, useState } from "react";

export const LoginContext = createContext();

const LoginContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const updateUserState = (userData) => {
    if (!userData?.id) {
        console.error('User data missing ID:', userData);
        throw new Error('Invalid user data - missing ID');
    }
    
    const userWithToken = {
        ...userData,
        id: String(userData.id), // Ensure consistent format
        token: userData.token
    };
    setUserInfo(userWithToken);
    localStorage.setItem("userInfo", JSON.stringify(userWithToken));
    setIsLogin(true);
}

  const clearUserState = () => {
    setIsLogin(false);
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/users/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("❌ 로그아웃 실패", err);
    }
    clearUserState();
  };

  

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/info", {
          credentials: "include",
        });
  
        if (!res.ok) throw new Error("인증 실패");
  
        const data = await res.json();
        console.log("받아온 사용자 정보:", data);
        updateUserState(data);
        console.log("✅ 자동 로그인 성공");
      } catch (err) {
        console.log("❌ 자동 로그인 실패", err);
        clearUserState();
        setError("자동 로그인 실패");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserInfo();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLoading,
        isLogin,
        userInfo,
        updateUserState,
        logout,
        error,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;
