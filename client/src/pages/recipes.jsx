import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import { sellers } from '../data/sellers';
import styles from '../styles/Recipe.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const RecipeList = () => {
    const navigate = useNavigate();
    const { keyword } = useParams(); // URL에서 검색어 가져오기
    const [liked, setLiked] = useState({});
    const [recipeList, setRecipeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setLoading(true);
                const url = keyword 
                    ? `/api/recipes?keyword=${keyword}` // 검색어가 있을 경우
                    : `/api/recipes`; // 검색어가 없을 경우

                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error('서버 응답 오류');
                }
                
                const data = await response.json();
                setRecipeList(data); // 가져온 데이터를 상태에 저장
                setError(null);
            } catch (err) {
                console.error('레시피 불러오기 실패:', err);
                setError('레시피를 불러오는 데 실패했습니다.');
                setRecipeList([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchRecipes();
    }, [keyword]);

    if (loading) return <div>레시피를 불러오는 중...</div>;
    if (error) return <div>{error}</div>;
    if (recipeList.length === 0) return <div>레시피를 찾을 수 없습니다.</div>;

    const goToSearch = () => {
        navigate('/search_recipe');
    };

    const handleHeartClick = async (id) => {
        const willBeLiked = !liked[id];

        try {
            const response = await fetch(`/api/recipes/${id}/like`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ liked: willBeLiked }),
            });

            if (!response.ok) {
                throw new Error("좋아요 상태 변경 실패");
            }

            const data = await response.json();
            console.log(data.message);

            setLiked(prev => {
                const newLiked = { ...prev };
                newLiked[id] = willBeLiked;
                return newLiked;
            });
        } catch (err) {
            console.error(err);
        }
    };
    
    const getSellerName = (userId) => {
        const seller = sellers.find(s => s.id === userId);
        return seller ? seller.name : '알 수 없음';
    };

    return (
        <div className={{ ...styles.page, paddingBottom: 60 }}>
            <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                <HiOutlineSearch size={20} color="#888" className={{ marginRight: 8 }} />
                <input
                    type="text"
                    onClick={goToSearch}
                    placeholder="원하는 음식을 검색해보세요"
                    className={styles.searchInputBox}
                />
                </div>
            </div>
        
            {keyword && (
                <div className={styles.sectionTitleBar}>
                    <h3 className={styles.resultTitle}>
                        "{keyword}" 검색 결과
                    </h3>
                    <p className={styles.resultCount}>{recipeList.length}개의 레시피를 찾았습니다</p>
                </div>
            )}

            {!keyword && (
                <div className={styles.sectionTitleBar}>
                    <h3 className={styles.resultTitle}>
                        {recipeList.length}개의 등록된 레시피
                    </h3>
                </div>
            )}

            <div className={styles.recipeSection}>
                {recipeList.map(item => (
                <div className={styles.recipeCard} key={item.recipe_id}>
                    <div className={styles.recipeImage} onClick={() => navigate(`/recipe_detail/${item.recipe_id}`)}></div>
                    <div className={styles.recipeInfo} onClick={() => navigate(`/recipe_detail/${item.recipe_id}`)}>
                    <div className={styles.recipeTitle}>
                        {item.title}
                        <span className={styles.likes}> 💚{item.like_cnt}</span>
                    </div>
                    <div className={styles.recipeDesc}>{getSellerName(item.user_id)}</div>
                </div>
                    <div className={styles.heart} onClick={(e) => {e.stopPropagation(); handleHeartClick(item.recipe_id)}}>
                        {liked[item.recipe_id] ? '❤️' : '♡'}
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}

export default RecipeList;