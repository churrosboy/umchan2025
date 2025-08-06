import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import { sellers } from '../data/sellers';

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
                    ? `http://localhost:4000/api/recipes?keyword=${keyword}` // 검색어가 있을 경우
                    : 'http://localhost:4000/api/recipes'; // 검색어가 없을 경우
                
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
            const response = await fetch(`http://localhost:4000/api/recipes/${id}/like`, {
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
        <div style={{ ...styles.page, paddingBottom: 60 }}>
            <div style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                width: '90%',
                maxWidth: 500,
            }}>
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '10px 14px',
                    borderRadius: '999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                <HiOutlineSearch size={20} color="#888" style={{ marginRight: 8 }} />
                <input
                    type="text"
                    onClick={goToSearch}
                    placeholder="원하는 음식을 검색해보세요"
                    style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    flex: 1,
                    fontSize: 14,
                    color: '#333',
                    }}
                />
                </div>
            </div>
        
            {keyword && (
                <div style={styles.sectionTitleBar}>
                    <h3 style={styles.resultTitle}>
                        "{keyword}" 검색 결과
                    </h3>
                    <p style={styles.resultCount}>{recipeList.length}개의 레시피를 찾았습니다</p>
                </div>
            )}

            {!keyword && (
                <div style={styles.sectionTitleBar}>
                    <h3 style={styles.resultTitle}>
                        {recipeList.length}개의 등록된 레시피
                    </h3>
                </div>
            )}

            <div style={styles.recipeSection}>
                {recipeList.map(item => (
                <div style={styles.recipeCard} key={item.recipe_id}>
                    <div style={styles.recipeImage} onClick={() => navigate(`/recipe_detail/${item.recipe_id}`)}></div>
                    <div style={styles.recipeInfo} onClick={() => navigate(`/recipe_detail/${item.recipe_id}`)}>
                    <div style={styles.recipeTitle}>
                        {item.title}
                        <span style={styles.likes}> 💚{item.like_cnt}</span>
                    </div>
                    <div style={styles.recipeDesc}>{getSellerName(item.user_id)}</div>
                </div>
                    <div style={styles.heart} onClick={(e) => {e.stopPropagation(); handleHeartClick(item.recipe_id)}}>
                        {liked[item.recipe_id] ? '❤️' : '♡'}
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    sectionTitleBar: {
        paddingTop: "70px",
        paddingRight: "20px", 
        paddingBottom: "6px",
        paddingLeft: "20px",
        fontSize: 14,
        fontWeight: "bold",
        backgroundColor: "#f7f7f7",
    },
    recipeSection: {
        overflowY: "auto",
        borderBottom: "8px solid #f7f7f7",
        background: "#fff",
    },
    recipeCard: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid #eee",
        background: "#fff",
    },
    recipeImage: {
      cursor: "pointer",
        width: 60,
        height: 60,
        backgroundColor: "#ddd",
        borderRadius: 6,
        marginRight: 10,
        flexShrink: 0,
    },
    recipeInfo: {
      cursor: "pointer",
        flex: 1,
        fontSize: 14,
        minWidth: 0,
    },
    recipeTitle: {
      cursor: "pointer",
        fontWeight: "bold",
        marginBottom: 4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    recipeDesc: {
        fontSize: 12,
        color: "#666",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        lineClamp: 2,
        WebkitBoxOrient: "vertical",
        maxWidth: "100%",
        lineHeight: 1.4,
        maxHeight: "2.8em",
    },
    heart: {
        fontSize: 16,
        color: "#888",
        marginLeft: 10,
        alignSelf: "center",
        cursor: "pointer",
    },
    page: {
        minHeight: "100vh",
        background: "#fff",
    },
    likes: {
        marginLeft: 'auto',
        fontSize: '13px',
        color: '#23a34a',
    },
};

export default RecipeList;