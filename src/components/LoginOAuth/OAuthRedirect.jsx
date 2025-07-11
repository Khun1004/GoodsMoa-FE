import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../contexts/LoginContext";

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { updateUserState } = useContext(LoginContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/info`, {
          method: "GET",
          credentials: "include", // ✅ 쿠키 포함!
        });

        if (!response.ok) throw new Error("유저 정보 요청 실패");

        const userData = await response.json();

        await updateUserState(userData); // ✅ 컨텍스트에 저장
        console.log("✅ 로그인 완료:", userData);

        navigate("/"); // 홈으로 이동
      } catch (err) {
        console.error("❌ 로그인 실패:", err);
        navigate("/Login"); // 로그인 실패 시 로그인 페이지로
      }
    };

    fetchUserInfo();
  }, [navigate, updateUserState]);

  return <div>로그인 중입니다...</div>;
};

export default OAuthRedirect;
