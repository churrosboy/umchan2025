import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';
import styles from '../styles/RecipeDetail.module.css';

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
        return <div className={styles.noResult}>레시피 정보를 불러오는 중입니다...</div>;
    }
    if (!recipe) {
        return <div className={styles.noResult}>레시피를 찾을 수 없습니다.</div>;
    }

    return (
        <div className={styles.pageBackground}>
            <div className={styles.recipeWrapper}>
                <div className={styles.recipeHeader}>
                    <button className={styles.backBtn} onClick={goBack}>{'←'}</button>
                    <h2 className={{ margin: 0, fontSize: '18px' }}>{sellerName}<span className={{ margin: 0, fontSize: '15px' }}> 님의 레시피</span></h2>
                    <div className={styles.spacer} />
                </div>

                {/* 메인 이미지 */}
                {recipe.thumbnail && (
                    <div className={styles.recipeImage}>
                        <img
                            src={`${recipe.thumbnail}`}
                            alt={recipe.title}
                            className={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                                console.error('메인 이미지 로드 실패:', e.target.src);
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className={styles.recipeInfo}>
                    <div className={styles.recipeTitle}>
                        <h3 className={styles.recipeName}>{recipe.title}</h3>
                        <span className={styles.rating}>
                            <Star width={17} height={17} className={{ verticalAlign: 'middle' }}/>
                            {recipe.rating} ({recipe.reviews || 0})
                        </span>
                        <span className={styles.likes}>
                            <Heart width={19} height={19} className={{ verticalAlign: 'middle' }}/>
                            {recipe.hearts || 0}
                        </span>
                    </div>
                    
                    <div className={styles.recipeMeta}>
                        <p className={styles.metaTitle}>재료</p>
                        <div className={styles.ingredientGrid}>
                            {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                                <div key={idx} className={styles.ingredientItem}>
                                    <span className={styles.ingredientName}>{ingredient.name}</span>
                                    <span className={styles.ingredientAmount}>{ingredient.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 조리 단계 */}
                <div className={styles.recipeSteps}>
                    <h4 className={styles.stepsTitle}>조리 단계</h4>
                    {recipe.steps && recipe.steps.map((step) => (
                        <div className={styles.recipeStep} key={step.step_num}>
                            <div className={styles.stepHeader}>
                                <div className={styles.stepNumberBadge}>{step.step_num}</div>
                                <h4 className={styles.stepTitle}>단계 {step.step_num}</h4>
                            </div>
                            
                            <div className={styles.stepContent}>
                                <div className={styles.stepImageContainer}>
                                    {step.img && (
                                        <img 
                                            src={step.img} 
                                            alt={`단계 ${step.step_num} 이미지`} 
                                            className={styles.stepImage} 
                                        />
                                    )}
                                </div>
                                <p className={styles.stepText}>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 댓글 섹션 */}
                <div className={styles.commentsSection}>
                    <h4 className={styles.commentsTitle}>댓글</h4>
                    <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                        <div className={styles.commentInputGroup}>
                            <div className={styles.nameInput}>사용자이름</div>
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="댓글을 입력하세요"
                                className={styles.commentInput}
                                required
                            />
                            <button type="submit" className={styles.commentSubmit}>
                                등록
                            </button>
                        </div>
                    </form>
                    
                    {recipe.comments && recipe.comments.length > 0 ? (
                        recipe.comments.map((comment, idx) => (
                            <div className={styles.comment} key={idx}>
                                <span className={styles.commentWriter}>{comment.writer}</span>
                                <span className={styles.commentDate}>
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                </span>
                                <span className={styles.commentContent}>{comment.content}</span>
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

export default RecipeDetail;