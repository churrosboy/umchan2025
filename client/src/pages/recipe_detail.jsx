import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';

const API_URL = process.env.REACT_APP_API_URL;

const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [sellerName, setSellerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    // 레시피 데이터 불러오기
    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/recipes/${recipeId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecipe(data);
                    setSellerName(data.sellerName || '알 수 없음');
                }
            } catch (err) {
                setRecipe(null);
            }
            setLoading(false);
        };
        fetchRecipe();
    }, [recipeId]);

    const goBack = () => {
        navigate(-1);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        
        try {
            await fetch(`/api/recipes/${recipeId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ writer: '사용자', content: comment }),
            });
            
            setComment("");
            
            // 댓글 추가 후 레시피 정보 다시 불러오기
            const response = await fetch(`/api/recipes/${recipeId}`);
            if (response.ok) {
                const data = await response.json();
                setRecipe(data);
            }
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
        <div style={styles.pageBackground}>
            <div style={styles.recipeWrapper}>
                <div style={styles.recipeHeader}>
                    <button style={styles.backBtn} onClick={goBack}>{'←'}</button>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>{sellerName}<span style={{ margin: 0, fontSize: '15px' }}> 님의 레시피</span></h2>
                    <div style={styles.spacer} />
                </div>

                {/* 메인 이미지 */}
                {recipe.thumbnail && (
                    <div style={styles.recipeImage}>
                        <img
                            src={`${recipe.thumbnail}`}
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
                        <span style={styles.rating}>
                            <Star width={17} height={17} style={{ verticalAlign: 'middle' }}/>
                            {recipe.rating} ({recipe.reviews || 0})
                        </span>
                        <span style={styles.likes}>
                            <Heart width={19} height={19} style={{ verticalAlign: 'middle' }}/>
                            {recipe.hearts || 0}
                        </span>
                    </div>
                    
                    <div style={styles.recipeMeta}>
                        <p style={styles.metaTitle}>재료</p>
                        <div style={styles.ingredientGrid}>
                            {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                                <div key={idx} style={styles.ingredientItem}>
                                    <span style={styles.ingredientName}>{ingredient.name}</span>
                                    <span style={styles.ingredientAmount}>{ingredient.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 조리 단계 */}
                <div style={styles.recipeSteps}>
                    <h4 style={styles.stepsTitle}>조리 단계</h4>
                    {recipe.steps && recipe.steps.map((step) => (
                        <div style={styles.recipeStep} key={step.step_num}>
                            <div style={styles.stepHeader}>
                                <div style={styles.stepNumberBadge}>{step.step_num}</div>
                                <h4 style={styles.stepTitle}>단계 {step.step_num}</h4>
                            </div>
                            
                            <div style={styles.stepContent}>
                                <div style={styles.stepImageContainer}>
                                    {step.img && (
                                        <img 
                                            src={step.img} 
                                            alt={`단계 ${step.step_num} 이미지`} 
                                            style={styles.stepImage} 
                                        />
                                    )}
                                </div>
                                <p style={styles.stepText}>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 댓글 섹션 */}
                <div style={styles.commentsSection}>
                    <h4 style={styles.commentsTitle}>댓글</h4>
                    <form onSubmit={handleSubmitComment} style={styles.commentForm}>
                        <div style={styles.commentInputGroup}>
                            <div style={styles.nameInput}>사용자이름</div>
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="댓글을 입력하세요"
                                style={styles.commentInput}
                                required
                            />
                            <button type="submit" style={styles.commentSubmit}>
                                등록
                            </button>
                        </div>
                    </form>
                    
                    {recipe.comments && recipe.comments.length > 0 ? (
                        recipe.comments.map((comment, idx) => (
                            <div style={styles.comment} key={idx}>
                                <span style={styles.commentWriter}>{comment.writer}</span>
                                <span style={styles.commentDate}>
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                </span>
                                <span style={styles.commentContent}>{comment.content}</span>
                            </div>
                        ))
                    ) : (
                        <p>아직 댓글이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    recipeWrapper: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '50px'
    },
    recipeHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
    },
    backBtn: {
        fontSize: '22px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px'
    },
    spacer: {
        width: '40px',
        height: '1px'
    },
    recipeImage: {
        marginBottom: '24px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    recipeInfo: {
        marginBottom: '24px'
    },
    recipeTitle: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    recipeName: {
        margin: '0 16px 0 0',
        fontSize: '20px'
    },
    rating: {
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: '12px',
        fontSize: '14px',
        color: '#666'
    },
    likes: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#666'
    },
    recipeMeta: {
        marginTop: '16px'
    },
    metaTitle: {
        margin: '0 0 8px',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    ingredientGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
    },
    ingredientItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
    },
    ingredientName: {
        fontWeight: 'bold'
    },
    recipeSteps: {
        marginBottom: '24px'
    },
    stepsTitle: {
        margin: '0 0 16px',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    recipeStep: {
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
    },
    stepHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px'
    },
    stepNumberBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#ffbf49ff',
        color: 'white',
        marginRight: '8px',
        fontSize: '14px'
    },
    stepTitle: {
        margin: 0,
        fontSize: '16px'
    },
    stepContent: {
        display: 'flex',
        flexDirection: 'column'
    },
    stepImageContainer: {
        marginBottom: '12px'
    },
    stepImage: {
        width: '100%',
        maxHeight: '200px',
        objectFit: 'cover',
        borderRadius: '4px'
    },
    stepText: {
        margin: 0,
        lineHeight: '1.5'
    },
    commentsSection: {
        marginTop: '32px'
    },
    commentsTitle: {
        margin: '0 0 16px',
        fontSize: '16px'
    },
    commentForm: {
        marginBottom: '16px'
    },
    commentInputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    nameInput: {
        fontWeight: 'bold',
        fontSize: '14px'
    },
    commentInput: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        resize: 'none'
    },
    commentSubmit: {
        alignSelf: 'flex-end',
        padding: '8px 16px',
        backgroundColor: '#FFD600',
        color: '#222',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    comment: {
        padding: '12px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        marginBottom: '8px'
    },
    commentWriter: {
        fontWeight: 'bold',
        marginRight: '8px'
    },
    commentDate: {
        fontSize: '12px',
        color: '#999'
    },
    commentContent: {
        display: 'block',
        marginTop: '6px'
    },
    noResult: {
        textAlign: 'center',
        padding: '32px',
        fontSize: '16px',
        color: '#666'
    },
    commentContainer: {
        background: '#fdbd3dff',
        borderRadius: '12px',
        padding: '16px',
        margin: '12px 0',
        boxShadow: '0 2px 8px rgba(255, 214, 0, 0.15)',
    },
    commentHeader: {
        fontWeight: 'bold',
        color: '#222',
        marginBottom: '8px',
    },
    commentText: {
        color: '#222',
        fontSize: '15px',
        marginBottom: '6px',
    },
    commentMeta: {
        fontSize: '12px',
        color: '#888',
    },
    commentButton: {
        background: '#FFA000',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '6px 12px',
        cursor: 'pointer',
        marginTop: '8px',
    },
    pageBackground: {
        background: '#fff', // 전체 페이지 배경을 흰색으로
        minHeight: '100vh',
    },
};

export default RecipeDetail;