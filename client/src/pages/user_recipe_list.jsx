import React from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import { recipes } from '../data/recipes';


const RecipeList = () => {
    const { userId } = useParams(); //userId 받아오기
    const user = sellers.find(u => u.id === Number(userId));    //userId와 일치하는 sellers 의 데이터 저장
    const recipeList = recipes.filter(recipe => recipe.user_id === Number(userId)); //recipes에서 판매자가 등록한 레시피를 걸러주는 부분 --> recipeList에 저장
    const navigate = useNavigate();

    if (!user) return <div style={styles.header}>사용자를 찾을 수 없습니다.</div>;

    //뒤로가기 함수
    const goBack = () => {
        navigate(-1);
    };

    return (
        <div style={{ ...styles.page, paddingBottom: 60 }}>
            {/*헤더 - 뒤로가기 버튼, 유저 닉네임(제목)*/}
            <div style={styles.header}>
                <div style={styles.backButton} onClick={goBack}>←</div>
                <div style={styles.headerTitle}>{user.name}</div>
                <div style={styles.headerSpacer}></div>
            </div>
            {/*소제목*/}
            <div style={styles.sectionTitleBar}>등록한 레시피</div>
            <div style={styles.recipeSection}>
                {/*레시피 리스트*/}
                {recipeList.map(item => (
                  <div style={styles.recipeCard} key={item.id} onClick={() => navigate(`/recipe/${item.id}`)}> {/*레시피 클릭 시 레시피 페이지로 이동*/}
                    {/*레시피 이미지*/}
                    <div style={styles.recipeImage}></div>
                    {/*레시피 정보*/}
                    <div style={styles.recipeInfo}>
                    <div style={styles.recipeTitle}>
                        <span>{item.user_name}</span>{item.title}
                        <span style={styles.rating}> ⭐{item.rating}</span>
                        <span style={styles.likes}> 💚{item.hearts}</span>
                    </div>
                    <div style={styles.recipeDesc}>{item.desc}</div>
                  </div>
                  {/*레시피 수정을 위한 부분인듯? App.jsx에 연결되어있지 않아 뭔지 아직 모르겠음*/}
                  <div style={styles.editIcon} onClick={() => navigate(`/edit-recipe/${item.id}`)}>🖋️</div>
                </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        fontWeight: "bold",
        fontSize: 16,
        borderBottom: "1px solid #ddd",
        position: "relative",
        background: "#fff",
        zIndex: 2,
    },
    backButton: {
        cursor: "pointer",
        fontSize: 18,
        color: "#333",
    },
    headerTitle: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        fontWeight: "bold",
    },
    headerSpacer: {
        width: 18,
    },
    sectionTitleBar: {
        padding: "10px 20px 6px",
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
    editIcon: {
        fontSize: 16,
        color: "#888",
        marginLeft: 10,
        alignSelf: "center",
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
};

export default RecipeList;
