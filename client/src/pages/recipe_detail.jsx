import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';

const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [sellerName, setSellerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentInputs, setCommentInputs] = useState({});
    const [comments, setComments] = useState({});

    // 레시피 데이터 불러오기 (백엔드에서)
    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecipe(data);
                    // 판매자 정보도 백엔드에서 받아온다고 가정
                    setSellerName(data.sellerName || '알 수 없음');
                }
            } catch (err) {
                setRecipe(null);
            }
            setLoading(false);
        };
        fetchRecipe();
    }, [recipeId]);

    // 댓글 목록 불러오기
    const fetchComments = async (recipeId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(prev => ({ ...prev, [recipeId]: data }));
            }
        } catch (err) {
            console.error("댓글 불러오기 실패:", err);
        }
    };

    useEffect(() => {
        if (recipe) fetchComments(recipe.recipe_id);
    }, [recipe]);

    const goBack = () => {
        navigate(-1);
    };

    const handleCommentInput = (recipeId, value) => {
        setCommentInputs(prev => ({ ...prev, [recipeId]: value }));
    };

    const handleAddComment = async (recipeId) => {
        const content = commentInputs[recipeId];
        if (!content) return;
        try {
            await fetch(`http://localhost:4000/api/recipes/${recipeId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ writer: 123, content }), // 나중에 로그인한 유저의 이름으로 writer 설정하기!!
            });
            setCommentInputs(prev => ({ ...prev, [recipeId]: "" }));
            await fetchComments(recipeId);
        } catch (err) {
            console.error("댓글 등록 실패:", err);
        }
    };

    if (loading) {
        return <div style={styles.noResult}>레시피 정보를 불러오는 중입니다...</div>;
    }
    if (!recipe) {
        return <div style={styles.noResult}>레시피를 찾을 수 없습니다.</div>;
    }

    return (
        <div style={styles.recipeWrapper}>
            <div style={styles.recipeHeader}>
                <button style={styles.backBtn} onClick={goBack}>{'←'}</button>
                <h2 style={{ margin: 0, fontSize: '18px' }}>
                    {sellerName}
                    <span style={{ margin: 0, fontSize: '15px' }}> 님의 레시피</span>
                </h2>
                <div style={styles.spacer} />
            </div>

            {/* 메인 이미지 */}
            {recipe.thumbnail && (
                <div style={styles.recipeImage}>
                    <img
                        src={`http://localhost:4000${recipe.thumbnail}`}
                        alt={recipe.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                            console.error('메인 이미지 로드 실패:', e.target.src);
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div style={styles.recipeInfo}>
                <div style={styles.recipeTitle}>
                    <h3 style={styles.recipeName}>{recipe.title}</h3>
                    <span style={styles.rating}>⭐ {recipe.rating} ({recipe.reviews || 0})</span>
                    <span style={styles.likes}>💚 {recipe.hearts || 0}</span>
                </div>
                <p style={{ margin: '8px 0 16px', color: '#666', fontSize: '15px' }}>
                    {recipe.desc}
                </p>
                <div style={styles.recipeMeta}>
                    <p style={styles.metaTitle}>재료</p>
                    <div style={styles.ingredientGrid}>
                        {recipe.ingredients?.map((ingredient, idx) => (
                            <div key={idx} style={styles.ingredientItem}>
                                <span style={styles.ingredientName}>{ingredient.name}</span>
                                <span style={styles.ingredientAmount}>{ingredient.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <hr style={styles.hr} />

            {recipe.steps?.map((step) => (
                <div style={styles.recipeStep} key={step.step_num}>
                    <div style={styles.stepHeader}>
                        <div style={styles.stepNumberBadge}>{step.step_num}</div>
                        <h4 style={styles.stepTitle}>단계 {step.step_num}</h4>
                    </div>
                    <div style={styles.stepContent}>
                        <div style={styles.stepImageContainer}>
                            <img
                                src={step.img}
                                alt={`단계 ${step.step_num} 이미지`}
                                style={styles.stepImage}
                                onError={(e) => {
                                    console.error('단계 이미지 로드 실패:', e.target.src);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                        <p style={styles.stepText}>{step.text}</p>
                    </div>
                </div>
            ))}

            {/* 댓글 섹션 */}
            <div style={styles.commentsSection}>
                <h4 style={styles.commentsTitle}>댓글</h4>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleAddComment(recipe.recipe_id);
                    }}
                    style={styles.commentForm}
                >
                    <input
                        type="text"
                        value={commentInputs[recipe.recipe_id] || ""}
                        onChange={e => handleCommentInput(recipe.recipe_id, e.target.value)}
                        placeholder="댓글을 입력하세요"
                        style={styles.commentInput}
                        required
                    />
                    <button type="submit" style={styles.commentSubmit}>
                        등록
                    </button>
                </form>
                <div style={styles.commentsList}>
                    {(comments[recipe.recipe_id] || []).length === 0 ? (
                        <div style={styles.noComment}>아직 댓글이 없습니다.</div>
                    ) : (
                        comments[recipe.recipe_id]?.map((c, idx) => (
                            <div key={idx} style={styles.commentItem}>
                                <div style={styles.commentHeader}>
                                    <span style={styles.commentWriter}>{c.user_id || c.writer || "익명"}</span>
                                    <span style={styles.commentDate}>
                                        {c.timestamp ? new Date(c.timestamp).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : c.created_at ? new Date(c.created_at).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : "방금 전"}
                                    </span>
                                </div>
                                <div style={styles.commentContent}>{typeof c.text === "string" && c.text.trim() ? c.text : (typeof c.content === "string" && c.content.trim() ? c.content : "(내용 없음)")}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    recipeWrapper: {
        maxWidth: '600px', // 너비 증가로 콘텐츠 공간 확보
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderRadius: '12px',
        marginBottom: '30px'
    },
    recipeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0'
    },
    backBtn: {
        fontSize: '22px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#555',
        padding: '6px 10px',
        borderRadius: '50%',
        transition: 'background 0.2s',
        ':hover': {
            backgroundColor: '#f0f0f0'
        }
    },
    spacer: {
        width: '20px'
    },
    recipeImage: {
        marginBottom: '24px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    image: {
        width: '100%',
        maxWidth: '400px', // 500px에서 400px로 축소
        height: 'auto',
        maxHeight: '250px', // 300px에서 250px로 축소
        objectFit: 'cover',
        display: 'block',
        margin: '0 auto' // 중앙 정렬
    },
    recipeInfo: {
        marginBottom: '24px'
    },
    recipeTitle: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap', // 작은 화면에서 줄바꿈 허용
        gap: '10px',
        marginBottom: '16px'
    },
    recipeName: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        margin: '0',
        marginRight: 'auto' // 평점과 좋아요를 오른쪽으로 밀기
    },
    rating: {
        color: '#f5a623',
        fontWeight: '500',
        fontSize: '15px'
    },
    likes: {
        color: '#23a34a',
        fontWeight: '500',
        fontSize: '15px'
    },
    recipeMeta: {
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
    },
    metaTitle: {
        fontSize: '17px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#444'
    },
    ingredientGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 2단 그리드
        gap: '8px 20px', // 세로 간격 8px, 가로 간격 20px
        paddingLeft: '8px' // 약간의 여백
    },
    ingredientItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 0',
        fontSize: '15px',
        borderBottom: '1px dashed #e0e0e0'
    },
    ingredientName: {
        fontWeight: '500',
        color: '#333'
    },
    ingredientAmount: {
        color: '#666',
        marginLeft: '8px'
    },
    hr: {
        margin: '24px 0',
        border: 'none',
        height: '1px',
        backgroundColor: '#eaeaea'
    },
    recipeStep: {
        marginBottom: '32px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    },
    stepHeader: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        padding: '12px 16px',
        borderBottom: '1px solid #eee'
    },
    stepNumberBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: '#eecb88',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
        marginRight: '10px'
    },
    stepTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#444'
    },
    stepContent: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    stepImageContainer: {
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        textAlign: 'center',
        maxHeight: '300px' // 최대 높이 설정
    },
    stepImage: {
        width: 'auto', // 너비를 자동으로 조정
        maxWidth: '100%', // 컨테이너보다 크지 않게
        maxHeight: '300px', // 최대 높이 제한
        height: 'auto',
        objectFit: 'contain', // 이미지 비율 유지
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    stepText: {
        margin: '0',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#333',
        padding: '0 4px'
    },
    commentsSection: {
        marginTop: '32px',
        padding: '28px 20px',
        //background: 'linear-gradient(135deg, #f8fafc 0%, #ffd45cff 100%)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(60,80,120,0.10)',
        //border: '1px solid #fffa75ff',
    },
    commentsTitle: {
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '18px',
        color: '#000000ff',
        letterSpacing: '-1px',
    },
    commentForm: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        fontSize: '15px',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1.5px solid #ffd261ff',
        outline: 'none',
        background: '#ffffffff',
        transition: 'border 0.2s',
    },
    commentSubmit: {
        padding: '10px 20px',
        fontSize: '15px',
        background: 'linear-gradient(90deg, #ffe565ff 0%, #fed650ff 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(60,80,120,0.08)',
        transition: 'background 0.2s',
    },
    commentsList: {
        marginTop: '8px',
    },
    commentItem: {
        background: 'rgba(255, 255, 255, 1)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '10px',
        boxShadow: '0 1px 4px rgba(60,80,120,0.04)',
        border: '1px solid #0000004e',
        transition: 'box-shadow 0.2s',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
    },
    commentWriter: {
        fontWeight: 600,
        color: '#ffd54dff',
        fontSize: '14px',
        letterSpacing: '-0.5px',
    },
    commentDate: {
        fontSize: '12px',
        color: '#9ca3af',
    },
    commentContent: {
        fontSize: '15px',
        color: '#374151',
        marginTop: '2px',
        wordBreak: 'break-all',
        lineHeight: 1.6,
    },
    noComment: {
        color: '#ffef5eff',
        fontSize: '15px',
        textAlign: 'center',
        marginTop: '16px',
    },
    noResult: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#666'
    },
};

export default RecipeDetail;