import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlusCircle } from 'react-icons/hi2';
import styles from '../styles/MyRecipe.module.css';

const API_URL = process.env.REACT_APP_API_URL;

const MyRecipe = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recipeList, setRecipeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 사용자 정보와 레시피를 함께 가져오기
                const response = await fetch(`/api/recipes/user/${userId}`);
                if (!response.ok) throw new Error('데이터를 가져오는 데 실패했습니다.');
                const data = await response.json();

                if (data.length > 0) {
                    setUser(data[0].user_info[0]); // 첫 번째 레시피의 사용자 정보
                    setRecipeList(data); // 레시피 목록
                } else {
                    setUser(null);
                    setRecipeList([]);
                }

                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className={{ ...styles.page, paddingBottom: 60 }}>
            <div className={styles.header}>
                <div className={styles.backButton} onClick={goBack}>←</div>
                <div className={styles.headerTitle}>{user.name}</div>
                <div className={styles.headerSpacer}></div>
            </div>
            <div className={styles.sectionTitleBar}>등록한 레시피</div>
            <div className={styles.recipeSection}>
                {recipeList.map(item => (
                    <div className={styles.recipeCard} key={item.recipe_id} onClick={() => navigate(`/recipe/${item.recipe_id}`)}>
                        <div className={styles.recipeImage}></div>
                        <div className={styles.recipeInfo}>
                            <div className={styles.recipeTitle}>{item.title}</div>
                            <div className={styles.recipeDesc}>
                                {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }) : '날짜 없음'}
                            </div>
                        </div>
                        <div className={styles.editIcon}>🖋️</div>
                    </div>
                ))}
                <div className={styles.recipeCard}>
                    <HiPlusCircle size={22} />
                    <div className={styles.headerTitle}>레시피 공유하기</div>
                </div>
            </div>
        </div>
    );
};

export default MyRecipe;