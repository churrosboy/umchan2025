import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/AccountManagement.module.css";
import { users } from "../data/users";
import InlineEditor from "../components/InlineProfileEditor";

const AccountMng = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const user = users.find(u => u.id === Number(userId));

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.backButton} onClick={goBack}>←</div>
                    <div className={styles.title}>계정 관리</div>
                    <div className={styles.saveButton}>저장하기</div>
                </div>
                {/* 프로필 사진, 닉네임, 주소, 전화번호 수정 */}
            </div>
        </div>
    );
};

export default AccountMng;