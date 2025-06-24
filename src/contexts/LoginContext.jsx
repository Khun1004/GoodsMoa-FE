import React, { createContext, useEffect, useState } from "react";
import api from "../api/api"; // axios 인스턴스 import

export const LoginContext = createContext();

const LoginContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const updateUserState = (userData) => {
    if (!userData?.id) {
      console.error('User data missing ID:', userData);
      throw new Error('Invalid user data - missing ID');
    }
        
    const userWithToken = {
      ...userData,
      id: String(userData.id),
      token: userData.token
    };
    setUserInfo(userWithToken);
    localStorage.setItem("userInfo", JSON.stringify(userWithToken));
    setIsLogin(true);
        
    // 프로필 이미지가 있으면 로드
    if (userData.profileImage) {
      setProfileImage(userData.profileImage);
    }
  }

  const updateProfileImage = (image) => {
    setProfileImage(image);
    if (image) {
      localStorage.setItem('profileImage', image);
    } else {
      localStorage.removeItem('profileImage');
    }
  };
    
  // 초기 상태 로드 시 localStorage에서 프로필 이미지 가져오기
  useEffect(() => {
    const storedProfileImage = localStorage.getItem('profileImage');
    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }
  }, []);

  const verifyUser = (verified) => {
      setIsVerified(verified);
  };

  const clearUserState = () => {
    setIsLogin(false);
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  const logout = async () => {
    try {
      await api.post("/users/auth/logout", {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error("❌ 로그아웃 실패", err);
    }
    clearUserState();
  };
      
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get("/users/info", {
          withCredentials: true
        });
          
        console.log("받아온 사용자 정보:", res.data);
        updateUserState(res.data);
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
        profileImage,
        isVerified,
        updateUserState,
        updateProfileImage,
        verifyUser,
        logout,
        error,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;