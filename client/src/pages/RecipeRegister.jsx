import React, { useState } from 'react';
import { HiPhoto, HiChevronRight, HiMiniXCircle} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const RecipeRegister = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const [recipe, setRecipes] = useState({
    id: Date.now(),
    title: '',
    ingredients: [
      {name: '', amount: ''}
    ] ,
    file: null
  });

  const [steps, setSteps] = useState([
    { id: Date.now(), desc: '', file: null }
  ]);

  const addIngredient = () => {
    setRecipes(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {name: '', amount: ''}
      ]
    }));
  };

  const removeIngredient = idx => {
    setRecipes(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx)
    }));
  };

  const updateTitle = newTitle => {
    setRecipes(prev => ({
      ...prev,           // id, ingredients, file 등은 그대로
      title: newTitle    // title만 변경
    }));
  };

  const updateMainFile = newFile => {
    setRecipes(prev => ({
      ...prev,
      file: newFile
    }));
  };

  const updateIngredientName = (index, value) => {
    setRecipes(prev => {
      const next = [...prev.ingredients];
      next[index] = {...prev, name: value};
      return { ...prev, ingredients: next};
    });
  };

  const updateIngredientAmount = (index, value) => {
    setRecipes(prev => {
      const next = [...prev.ingredients];
      next[index] = {...prev, amount: value};
      return { ...prev, ingredients: next };
    });
  };

  const addStep = () => {
    setSteps(prev => [...prev, { id: Date.now(), desc: '', file: null }]);
  };

  const removeStep = id => {
    setSteps(prev => prev.filter(step => step.id !== id));
  };

  const updateDesc = (id, value) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, desc: value } : step));
  };

  const updateFile = (id, file) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, file } : step));
  };

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.backButton} onClick={goBack}>←</div>
        <div style={styles.headerTitle}>레시피 등록</div>
        <div style={styles.headerSpacer} />
      </div>

      {/* 본문 */}
      <div style={styles.container}>
        {/* 메뉴 메인사진 */}
        <div style={styles.uploadSection}>
          <label style={styles.photoLabel}>
            <input
              type="file"
              style={styles.photoInput}
              onChange={e => updateMainFile(e.target.files[0])}
            />
            {recipe.file ? (
              <img
                src={URL.createObjectURL(recipe.file)}
                alt="MainFile"
                style={styles.photoPreview}
              />
            ) : (
              <HiPhoto size={28} style={styles.stepIcon} />
            )}
          </label>
          <div style={styles.uploadLabel}>메뉴 메인사진 등록하기</div>
        </div>

        {/* 메뉴 이름 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>메뉴 이름</div>
          <input
            style={styles.inputField}
            type="text"
            value={recipe.title}
            onChange={e => updateTitle(e.target.value)}
            placeholder="입력하세요" />
        </div>

        {/* 재료 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>재료</div>
        
        
        {recipe.ingredients.map(({name ,amount}, idx) => (
          <div key={idx} style={styles.stepWrapper}>
            <HiMiniXCircle style={styles.removeIcon} onClick={() => removeIngredient(idx)} />
            <div style={styles.inputSectionIngredient}>
            <input
              type="text"
              value={name}
              onChange={e => updateIngredientName(idx, e.target.value)}
              placeholder="재료를 입력하세요"
              style={styles.inputFieldIngredient}
            />
            <input
              type="text"
              value={amount}
              onChange={e => updateIngredientAmount(idx, e.target.value)}
              placeholder="수량을 입력하세요"
              style={styles.inputFieldIngredient}
            />
            </div>
          </div>
        ))}
        
        {/* 단계 추가 버튼 */}
        <button style={styles.addButton} onClick={addIngredient}>+ 재료 추가</button>
        </div>

        {/* 동적 조리 단계 */}
        <div style={styles.stepsSection}>
          {/* 설명 라벨 */}
          <div style={styles.descriptionSection}>
            <div style={styles.descriptionLabel}>조리 순서를 등록해주세요 :)</div>
          </div>
          {steps.map((step, idx) => (
            <div key={step.id} style={styles.stepWrapper}>
              <HiMiniXCircle style={styles.removeIcon} onClick={() => removeStep(step.id)} />
              <div style={styles.stepCard}>
                <label style={styles.photoLabel}>
                  <input
                    type="file"
                    style={styles.photoInput}
                    onChange={e => updateFile(step.id, e.target.files[0])}
                  />
                  {step.file ? (
                    <img
                      src={URL.createObjectURL(step.file)}
                      alt="step"
                      style={styles.photoPreview}
                    />
                  ) : (
                    <HiPhoto size={28} style={styles.stepIcon} />
                  )}
                </label>
                <input
                  style={styles.stepInput}
                  type="text"
                  placeholder="조리 순서 설명"
                  value={step.desc}
                  onChange={e => updateDesc(step.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          {/* 단계 추가 버튼 */}
          <button style={styles.addButton} onClick={addStep}>+ 단계 추가</button>
          <div style={styles.margin2}></div>
        </div>


        {/* 다음 버튼 */}
        <button style={styles.submitButton}>
          다음<HiChevronRight style={styles.nextIcon} />
        </button>
        <div style={styles.margin}></div>
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column',},
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#fff', borderBottom: '1px solid #ddd', position: 'relative', zIndex: 1 },
  backButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' },
  headerTitle: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: 16 },
  headerSpacer: { width: 18 },
  container: { flex: 1, backgroundColor: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  uploadSection: { backgroundColor: '#FEFEFE', borderRadius: 15, padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E6E6E6' },
  uploadIcon: { color: '#888888' },
  uploadLabel: { fontSize: 17, fontWeight: 600, color: 'black' },
  inputSection: { backgroundColor: '#FEFEFE', borderRadius: 15, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #E6E6E6' },
  inputSectionIngredient: { borderRadius: 15, display: 'flex', flexDirection: 'column', gap: '8px'},
  inputTitle: { fontSize: 16, fontWeight: 600, color: '#111111' },
  inputField: { height: 40, borderRadius: 15, border: '0.5px solid #888888', padding: '0 12px', fontSize: 14 },
  inputFieldIngredient: { flex: 1, borderRadius: 15, border: '0.5px solid #888888', fontSize: 14, padding: '12px' },
  descriptionSection: { padding: '0 12px' },
  descriptionLabel: { fontSize: 17, fontWeight: 600, color: 'black' },
  stepsSection: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px'},
  stepWrapper: { position: 'relative' },
  removeIcon: { position: 'absolute', top: '4px', right: '4px', fontSize: 16, color: '#888888', cursor: 'pointer' },
  stepCard: { backgroundColor: '#FEFEFE', borderRadius: 15, padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E6E6E6' },
  photoLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, backgroundColor: '#DDD', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' },
  photoInput: { display: 'none' },
  photoPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  stepIcon: { color: '#888888' },
  stepInput: { flex: 1, height: 40, borderRadius: 15, border: '0.5px solid #888888', paddingLeft: '12px', fontSize: 14 },
  addButton: { backgroundColor: '#fff', border: '1px solid #888888', borderRadius: 15, padding: '8px 12px', fontSize: 14, cursor: 'pointer', alignSelf: 'center' },
  submitButton: { marginTop: 'auto', backgroundColor: '#FFD856', borderRadius: 15, padding: '12px', fontSize: 16, fontWeight: 600, color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', gap: '8px' },
  nextIcon: { fontSize: 20, color: '#888888' },
  margin2: {padding: '4px'},
  margin: {padding: '40px'}
};

export default RecipeRegister;
