import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AccountManagement.module.css";
import InlineEditor from "../components/InlineProfileEditor";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "";
const toPublicUrl = (src) => {
  if (!src) return null;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("blob:") || src.startsWith("data:")) return src;
  return `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
};

const AccountMng = () => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 미리보기 URL 정리용
  const revokeUrlsRef = useRef([]);

  const [state, setState] = useState({
    nickname: "",
    address: "",
    phone: "",

    // 프로필 이미지
    avatarPreview: null, // string | null (서버 URL 또는 blob URL)
    avatarFile: null,    // File | null
    clearAvatar: false,
  });

  const pushRevokeUrl = (url) => {
    if (url?.startsWith("blob:")) revokeUrlsRef.current.push(url);
  };
  useEffect(() => {
    return () => {
      revokeUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }
      try {
        setAuthUser(fbUser);
        const token = await fbUser.getIdToken();
        const res = await axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res?.data?.user;
        if (!user) {
          alert("사용자를 찾을 수 없습니다.");
          navigate("/");
          return;
        }
        setServerUser(user);
        setState((prev) => ({
          ...prev,
          nickname: user.nickname ?? "",
          address: user.address ?? "",
          phone: user.phone_number ?? "",
          avatarPreview: toPublicUrl(user.profile_image ?? null),
          avatarFile: null,
          clearAvatar: false,
        }));
      } catch (e) {
        console.error(e);
        alert("계정 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const onChangeAvatar = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    pushRevokeUrl(url);
    setState((s) => ({
      ...s,
      avatarPreview: url,
      avatarFile: file,
      clearAvatar: false,
    }));
  };

  const removeAvatar = () => {
    setState((s) => ({
      ...s,
      avatarPreview: null,
      avatarFile: null,
      clearAvatar: true,
    }));
  };

  const save = async () => {
    if (!authUser) return;
    try {
      const token = await authUser.getIdToken();
      const form = new FormData();
      form.append("nickname", state.nickname ?? "");
      form.append("address", state.address ?? "");
      form.append("phone_number", state.phone ?? "");
      if (state.avatarFile) {
        form.append("profile_image", state.avatarFile);
      }
      form.append("clear_profile_image", String(!!state.clearAvatar));

      const res = await axios.patch("/api/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = res?.data?.user;
      if (updated) {
        setServerUser(updated);
        setState((s) => ({
          ...s,
          avatarPreview: toPublicUrl(updated.profile_image ?? null),
          avatarFile: null,
          clearAvatar: false,
          // 서버가 가공/정규화했을 수도 있으니 텍스트도 동기화
          nickname: updated.nickname ?? s.nickname,
          address: updated.address ?? s.address,
          phone: updated.phone_number ?? s.phone,
        }));
      }
      alert("저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    }
  };

  const goBack = () => navigate(-1);
  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.backButton} onClick={goBack}>←</div>
          <div className={styles.headerTitle}>계정 관리</div>
          <div className={styles.saveButton} onClick={save}>저장하기</div>
        </div>

        <div className={styles.scrollArea}>
          {/* 아바타 */}
          <div className={styles.avatarWrap}>
            <label className={styles.avatarLabel}>
              <input
                type="file"
                accept="image/*"
                className={styles.photoInput}
                onChange={(e) => onChangeAvatar(e.target.files?.[0])}
              />
              {state.avatarPreview ? (
                <>
                  <img src={state.avatarPreview} alt="프로필" className={styles.avatarImg} />
                  <div
                    className={styles.removeIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeAvatar();
                    }}
                  >
                    ×
                  </div>
                </>
              ) : (
                <div className={styles.avatarEmpty}>+</div>
              )}
            </label>
            <div className={styles.avatarHint}>프로필 사진을 탭해서 변경</div>
          </div>

          {/* 닉네임 */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>닉네임</div>
            <InlineEditor
              initialValue={state.nickname}
              onSave={(v) => setState((s) => ({ ...s, nickname: v }))}
            />
          </div>

          {/* 주소 */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>주소</div>
            <InlineEditor
              initialValue={state.address}
              onSave={(v) => setState((s) => ({ ...s, address: v }))}
            />
          </div>

          {/* 전화번호 */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>전화번호</div>
            <InlineEditor
              initialValue={state.phone}
              onSave={(v) => setState((s) => ({ ...s, phone: v }))}
            />
          </div>

          <div className={styles.bottomSpacer} />
        </div>
      </div>
    </div>
  );
};

export default AccountMng;
