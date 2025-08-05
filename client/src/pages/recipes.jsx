import React, {useState} from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { HiOutlineSearch } from 'react-icons/hi';
import { sellers } from '../data/sellers';


const RecipeList = () => {
    const navigate = useNavigate();
    const { keyword } = useParams();    //화면에 띄울 레시피들을 관리하기 위한 키워드(검색 전 - all, 검색 후 - 검색어)
    const [liked, setLiked] = useState({});
    let recipeList = (keyword === 'all') ? recipes : recipes.filter(recipe => recipe.title.toLowerCase().includes(keyword.toLowerCase()));

    recipeList = recipeList.sort((a, b) => b.hearts - a.hearts);

    if (recipeList.length === 0) return <div style={styles.noResult}>사용자를 찾을 수 없습니다.</div>;

    const goToSearch = () => {
        navigate('/search_recipe');
    };

    const handleHeartClick = (id) => {
        const willBeLiked = !liked[id];
        
        if (willBeLiked) {
            console.log(`레시피 ${id}에 좋아요를 눌렀습니다.`);
        } else {
            console.log(`레시피 ${id}의 좋아요를 취소했습니다.`);
        }
        
        setLiked(prev => {
            const newLiked = {...prev};
            newLiked[id] = !prev[id];
            return newLiked;
        });
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

            {keyword !== 'all' && (
                <div style={styles.sectionTitleBar}>
                    <h3 style={styles.resultTitle}>"{keyword}" 검색 결과</h3>
                    <p style={styles.resultCount}>{recipeList.length}개의 레시피를 찾았습니다</p>
                </div>
            )}
            
            {keyword === 'all' && (
                <div style={styles.sectionTitleBar}>
                    <h3 style={styles.resultTitle}>등록된 레시피</h3>
                    <p style={styles.resultCount}>전체 {recipeList.length}개</p>
                </div>
            )}

            <div style={styles.recipeSection}>
                {recipeList.map(item => (
                <div style={styles.recipeCard} key={item.id}>
                    <div style={styles.recipeImage} onClick={() => navigate(`/recipe_detail/${item.id}`)}></div>
                    <div style={styles.recipeInfo} onClick={() => navigate(`/recipe_detail/${item.id}`)}>
                    <div style={styles.recipeTitle}>
                        <span>{item.user_name}</span>{item.title}
                        <span style={styles.rating}> ⭐{item.rating}</span>
                        <span style={styles.likes}> 💚{item.hearts}</span>
                    </div>
                    <div style={styles.recipeDesc}>{getSellerName(item.user_id)}</div>
                    <div style={styles.recipeDesc}>{item.desc}</div>
                </div>
                    <div style={styles.heart} onClick={(e) => {e.stopPropagation(); handleHeartClick(item.id)}}>
                        {liked[item.id] ? '❤️' : '♡'}
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
    rating: {
        color: '#f5a623',
    },
    likes: {
        marginLeft: 'auto',
        fontSize: '13px',
        color: '#23a34a',
    },
    noResult: {
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
        background: '#fff',
        paddingBottom: '60px', /* for nav */
        paddingTop: '100px', /* for nav */
  },
};

export default RecipeList;
