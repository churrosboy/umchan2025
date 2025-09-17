import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../../data/sellers';
import { recipes } from '../../data/recipes';
import styles from './UserList.module.css';

const RecipeList = () => {
  const { userId } = useParams();
  const user = sellers.find(u => u.id === Number(userId));
  const recipeList = recipes.filter(recipe => recipe.user_id === Number(userId));
  const navigate = useNavigate();

  if (!user) return <div className={styles.header} style={{ background: '#fff', zIndex: 2 }}>사용자를 찾을 수 없습니다.</div>;

  const goBack = () => {
    navigate(-1);
  };
  return (
    <div className={styles.page} style={{ paddingBottom: 60 }}>
      <div className={styles.header} style={{ background: '#fff', zIndex: 2 }}>
        <div className={styles.backButton} onClick={goBack}>←</div>
        <div className={styles.headerTitle}>{user.name}</div>
        <div className={styles.headerSpacer}></div>
      </div>
      <div className={styles.sectionTitleBar}>등록한 레시피</div>
      <div className={styles.recipeSection}>
        {recipeList.map(item => (
          <div className={styles.recipeCard} key={item.id} onClick={() => navigate(`/recipe/${item.id}`)}>
            <div className={styles.recipeImage}></div>
            <div className={styles.recipeInfo}>
              <div className={styles.recipeTitle}>
                <span>{item.user_name}</span>{item.title}
                <span className={styles.rating}> ⭐{item.rating}</span>
                <span className={styles.likes}> 💚{item.hearts}</span>
              </div>
              <div className={styles.recipeDesc}>{item.desc}</div>
            </div>
            <div className={styles.editIcon} onClick={() => navigate(`/edit-recipe/${item.id}`)}>🖋️</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeList;
