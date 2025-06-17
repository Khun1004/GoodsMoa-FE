import React, { useEffect, useState } from 'react';

const Loading = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 10초 후 사라짐

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            로딩 완료!
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            굿즈모아에 오신 것을 환영합니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center z-50 overflow-hidden">
      {/* 배경 글로우 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 animate-pulse"></div>
      
      {/* 메인 컨테이너 */}
      <div className="relative text-center space-y-10 p-8">
        {/* 메인 로딩 애니메이션 */}
        <div className="relative mx-auto w-32 h-32">
          {/* 외부 오빗 링 1 */}
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-spin bg-clip-border">
            <div className="absolute inset-[2px] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 rounded-full"></div>
          </div>
          
          {/* 외부 오빗 링 2 */}
          <div className="absolute inset-2 border-2 border-transparent bg-gradient-to-l from-cyan-400 via-blue-400 to-purple-400 rounded-full animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}}>
            <div className="absolute inset-[2px] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 rounded-full"></div>
          </div>
          
          {/* 중간 글로우 링 */}
          <div className="absolute inset-6 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-full animate-pulse blur-sm"></div>
          
          {/* 중앙 코어 */}
          <div className="absolute inset-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
            <div className="relative text-center">
              {/* 굿즈모아 텍스트 */}
              <div className="text-white font-bold text-sm animate-pulse">
                굿즈모아
              </div>
              
              {/* 텍스트 글로우 */}
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* 떠다니는 파티클들 */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-0 -left-4 w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute -top-4 right-0 w-2.5 h-2.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* 로딩 텍스트 섹션 */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
              로딩 중
            </h1>
            
            {/* 애니메이션 점들 */}
            <div className="flex justify-center items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
              </div>
            </div>
          </div>

          {/* 서브 텍스트 */}
          <div className="space-y-3">
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              잠시만 기다려주세요
            </p>
            
            {/* 프로그레스 바 */}
            <div className="w-64 h-2 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              최고의 경험을 준비하고 있습니다
            </p>
          </div>
        </div>

        {/* 하단 장식 웨이브 */}
        <div className="flex justify-center items-end space-x-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`bg-gradient-to-t from-blue-500 via-purple-500 to-cyan-500 rounded-t-full animate-pulse`}
              style={{
                width: `${4 + (i % 3)}px`,
                height: `${12 + (i * 2)}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* 배경 장식 파티클들 */}
      <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-blue-400/60 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-[60%] left-[10%] w-1 h-1 bg-cyan-400/40 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-[30%] right-[15%] w-2.5 h-2.5 bg-indigo-400/70 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-[60%] left-[25%] w-1.5 h-1.5 bg-pink-400/50 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-[40%] right-[30%] w-1 h-1 bg-blue-300/40 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
      
      {/* 코너 글로우 효과 */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default Loading;