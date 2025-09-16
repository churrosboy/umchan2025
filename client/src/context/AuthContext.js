import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Context 생성
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// Context를 제공하는 Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
        // onAuthStateChanged는 로그인, 로그아웃 등 인증 상태가 변경될 때마다 호출됨
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false); // 인증 상태 확인이 끝나면 로딩 상태를 false로 변경
        });

        // 컴포넌트가 언마운트될 때 구독을 해제하여 메모리 누수 방지
        return unsubscribe;
    }, []);

    const value = {
        currentUser
    };

    // 로딩 중이 아닐 때만 children을 렌더링
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};