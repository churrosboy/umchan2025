import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import header from "../styles/PageHeader.module.css";
import "../styles/AuthReqStyle.module.css";
import axios from "axios";
import { getAuth } from "firebase/auth";

const AuthReq = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null); // 미리보기(서버 URL 또는 blob)
  const [file, setFile] = useState(null);       // 업로드 파일
  const [status, setStatus] = useState(null);   // pending/approved/rejected
  const revokeUrlsRef = useRef([]);

  const goBack = () => navigate(-1);

  // blob URL 정리
  const pushRevoke = (url) => {
    if (url?.startsWith("blob:")) revokeUrlsRef.current.push(url);
  };
  useEffect(() => {
    return () => {
      revokeUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // 기존 내 요청 로드
  useEffect(() => {
    (async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const { data } = await axios.get("/api/sanitary/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const req = data?.request;
        if (req) {
          setPreview(req.image_url || null); // 서버가 '/api/uploads/...' 반환
          setStatus(req.status || null);
          setFile(null);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    pushRevoke(url);
    setPreview(url);
    setFile(f);
  };

  const clearPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setFile(null);
  };

  const submit = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (!file) {
        alert("주방 사진을 업로드해주세요.");
        return;
      }
      const token = await user.getIdToken();

      const form = new FormData();
      form.append("kitchen_image", file);

      const { data } = await axios.post("/api/sanitary/request", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const saved = data?.request;
      if (saved) {
        setPreview(saved.image_url || null); // 서버 URL로 스위치
        setStatus(saved.status || "pending");
        setFile(null);
        alert("인증 요청이 접수되었습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("요청에 실패했습니다.");
    }
  };

  return (
    <div className={header.wrapper}>
      <div className={header.container}>
        <div className={header.header}>
          <div className={header.backButton} onClick={goBack}>←</div>
          <div className={header.title}>위생인증 요청하기</div>
          <div className={header.saveButton} />
        </div>

        {/* 카드 */}
        <div className="authreq-card">
          <div className="authreq-title">주방 사진을 찍어 업로드해주세요</div>
          <div className="authreq-subtitle">선명한 사진일수록 승인 확률이 높아요.</div>

          {/* 업로드 슬롯 */}
          <div className="authreq-slotRow">
            <label htmlFor="kitchen-upload" className="authreq-slot">
              <input
                id="kitchen-upload"
                type="file"
                accept="image/*"
                className="authreq-fileInput"
                onChange={onFileChange}
              />
              {preview ? (
                <>
                  <img src={preview} alt="kitchen" className="authreq-slotImg" />
                  <div className="authreq-remove" onClick={clearPhoto}>×</div>
                </>
              ) : (
                <div className="authreq-plus">+</div>
              )}
            </label>
          </div>

          {/* 상태 배지 */}
          {status && (
            <div className={`authreq-status authreq-status--${status}`}>
              {status === "pending" ? "검토 대기중" : status === "approved" ? "승인됨" : "반려됨"}
            </div>
          )}

          {/* 노란 버튼 */}
          <div className="authreq-actions">
            <button
              className="authreq-yellowBtn"
              onClick={submit}
              disabled={!preview || !!(preview && !file)} 
              title={!preview ? "사진을 업로드해주세요" : undefined}
            >
              인증 요청 전송하기
            </button>
          </div>

          {/* 힌트 */}
          <ul className="authreq-hints">
            <li>조리대, 조리기구, 위생상태가 잘 보이도록 촬영해주세요.</li>
            <li>개인정보(주소, 전화번호 등)가 사진에 노출되지 않게 주의하세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthReq;
