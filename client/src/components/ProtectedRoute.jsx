import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // currentUser가 없으면(로그인하지 않았으면) 로그인 페이지로 리디렉션
        return <Navigate to="/" />;
    }

    // 로그인했다면 요청한 페이지(children)를 보여줌
    return children;
};

export default ProtectedRoute;