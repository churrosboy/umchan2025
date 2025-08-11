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