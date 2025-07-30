import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { sellers } from '../data/sellers';

const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [comment, setComment] = useState(''); // 댓글 입력 상태

    const recipe = recipes.find(r => r.id === Number(recipeId));
    if (!recipe) {
        return <div style={styles.noResult}>레시피를 찾을 수 없습니다.</div>;
    }

    const seller = sellers.find(s => s.id === recipe.user_id);
    const sellerName = seller ? seller.name : '알 수 없음';

    recipe.steps = recipe.steps.sort((a, b) => a.step_num - b.step_num);
    recipe.comments = recipe.comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const goBack = () => {
        navigate(-1);
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const newComment = {
            writer: '사용자이름',
            content: comment,
            timestamp: new Date().toISOString()
        };
        
        console.log('새 댓글:', newComment);
    };
    
    return (
        <div style={styles.recipeWrapper}>
        <div style={styles.recipeHeader}>
            <button style={styles.backBtn} onClick={goBack}>{'←'}</button>
            <h2 style={{ margin: 0, fontSize: '18px' }}>{sellerName}<span style={{ margin: 0, fontSize: '15px' }}> 님의 레시피</span></h2>
            <div style={styles.spacer} />
        </div>

        <div style={styles.recipeImage}>
            <img 
                src={recipe.thumbnail} 
                alt="레시피 대표 이미지" 
                style={styles.image} 
            />
        </div>

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
                    {recipe.ingredients.map((ingredient, idx) => (
                        <div key={idx} style={styles.ingredientItem}>
                            <span style={styles.ingredientName}>{ingredient.name}</span>
                            <span style={styles.ingredientAmount}>{ingredient.amount}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <hr style={styles.hr} />

        {recipe.steps.map((step) => (
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
                        />
                    </div>
                    <p style={styles.stepText}>{step.text}</p>
                </div>
            </div>
        ))}

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
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        paddingBottom: '150px',
    },
    commentsTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#444'
    },
    comment: {
        padding: '12px 0',
        borderBottom: '1px solid #eee'
    },
    commentWriter: {
        fontWeight: '600',
        marginRight: '10px',
        color: '#333'
    },
    commentContent: {
        display: 'block',
        margin: '6px 0',
        lineHeight: '1.5'
    },
    commentDate: {
        float: 'right',
        fontSize: '0.8rem',
        color: '#888'
    },
    noResult: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#666'
    },
    commentForm: {
        marginBottom: '24px',
        backgroundColor: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
    },
    commentInputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    nameInput: {
        padding: '10px 12px',
        fontSize: '14px',
        width: '150px'
    },
    commentInput: {
        flex: 1,
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '14px',
        marginBottom: '10px'
    },
    commentSubmit: {
        padding: '10px 20px',
        backgroundColor: '#eecb88',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        alignSelf: 'flex-end',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#e0b977'
        }
    },
    commentsSection: {
        marginTop: '32px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '20px',
    },
};

export default RecipeDetail;