import React, { useContext, useEffect } from 'react';
import { LoginContext } from './contexts/LoginContext';

const AuthWrapper = ({ children }) => {
    const { isLogin, userInfo } = useContext(LoginContext);
    
    useEffect(() => {
        // When component mounts or login state changes, update user info in localStorage
        if (isLogin && userInfo) {
            if (userInfo.id) {
                localStorage.setItem('user_id', userInfo.id.toString());
                console.log('User ID set in localStorage:', userInfo.id);
            }
            
            // Also save user name for form submissions
            if (userInfo.name) {
                localStorage.setItem('userName', userInfo.name);
                console.log('User name set in localStorage:', userInfo.name);
            } else {
                // If no name, use a default one
                localStorage.setItem('userName', '사용자');
                console.log('Default user name set in localStorage');
            }
        } else {
            // If not logged in or no user info, keep existing stored values but log warning
            const existingUserId = localStorage.getItem('user_id');
            if (!existingUserId) {
                console.warn('No user ID available. Some features may not work correctly.');
            }
            
            // Ensure there's always a default user name
            if (!localStorage.getItem('userName')) {
                localStorage.setItem('userName', '사용자');
            }
        }
    }, [isLogin, userInfo]);
    
    return <>{children}</>;
};

export default AuthWrapper;