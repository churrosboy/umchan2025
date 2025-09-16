import React, { useState } from 'react';
import { HiPhoto, HiChevronRight, HiMiniXCircle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import styles from './RecipeRegister.module.css';
const API_URL = process.env.REACT_APP_API_URL;


const RecipeRegister = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const [recipe, setRecipes] = useState({
    id: Date.now(),
    title: '',
    ingredients: [{ name: '', amount: '' }],
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
        { name: '', amount: '' }
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

  const updateIngredient = (index, field, value) => {
    setRecipes(prev => {
      const next = [...prev.ingredients];
      next[index] = { ...next[index], [field]: value };
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

  // 레시피 등록 핸들러 (파일 포함)
  const handleSubmit = async () => {
    // 유효성 검사: 제목, 재료, 단계 설명 모두 비어있으면 등록 불가
    if (!recipe.title.trim()) {
      alert('메뉴 이름을 입력하세요.');
      return;
    }
    if (!recipe.ingredients.length || recipe.ingredients.some(ing => !ing.name.trim() || !ing.amount.trim())) {
      alert('모든 재료명과 양을 입력하세요.');
      return;
    }
    if (!steps.length || steps.some(step => !step.desc.trim())) {
      alert('모든 조리 순서 설명을 입력하세요.');
      return;
    }

    // 파일이 없으면 JSON으로 전송
    if (!recipe.file && steps.every(step => !step.file)) {
      const data = {
        user_id: 123,
        name: recipe.title,
        text: steps.map(s => s.desc).join('\n'),
        ingredients: recipe.ingredients,
        steps: steps.map((step, idx) => ({
          step_num: idx + 1,
          text: step.desc,
          img: '' // 파일이 없으므로 빈 문자열
        }))
      };
      try {
        const response = await fetch(`/api/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          alert('레시피 등록 성공!');
          navigate('/profile');
        } else {
          alert('레시피 등록 실패');
        }
      } catch (err) {
        alert('에러 발생');
      }
    } else {
      // 파일이 하나라도 있으면 FormData로 전송
      const formData = new FormData();
      formData.append('user_id', 123);
      formData.append('name', recipe.title);
      formData.append('text', steps.map(s => s.desc).join('\n'));
      formData.append('ingredients', JSON.stringify(recipe.ingredients));

      // 메인 이미지
      if (recipe.file) {
        console.log('Adding main image:', recipe.file.name);
        formData.append('mainImage', recipe.file);
      }

      // 단계별 이미지와 설명을 배열로 저장
      const stepsData = steps.map((step, idx) => ({
        step_num: idx + 1,
        text: step.desc,
        img: ''
      }));

      // FormData에 steps 배열 추가
      formData.append('steps', JSON.stringify(stepsData));

      // 단계별 이미지 파일 추가
      steps.forEach((step, idx) => {
        if (step.file) {
          console.log(`Adding step ${idx} image:`, step.file.name);
          formData.append(`stepImage${idx}`, step.file);
        }
      });

      // FormData 내용 확인
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], ':', pair[1]);
      }
      try {
        const response = await fetch(`/api/recipes`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert('레시피 등록 성공!');
          navigate('/profile');
        } else {
          alert('레시피 등록 실패');
        }
      } catch (err) {
        alert('에러 발생');
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.backButton} onClick={goBack}>←</div>
        <div className={styles.headerTitle}>레시피 등록</div>
        <div className={styles.headerSpacer} />
      </div>

      {/* 본문 */}
      <div className={styles.container}>
        {/* 메뉴 메인사진 */}
        <div className={styles.uploadSection}>
          <label className={styles.photoLabel}>
            <input
              type="file"
              className={styles.photoInput}
              onChange={e => updateMainFile(e.target.files[0])}
            />
            {recipe.file ? (
              <img
                src={URL.createObjectURL(recipe.file)}
                alt="MainFile"
                className={styles.photoPreview}
              />
            ) : (
              <HiPhoto size={28} className={styles.stepIcon} />
            )}
          </label>
          <div className={styles.uploadLabel}>메뉴 메인사진 등록하기</div>
        </div>

        {/* 메뉴 이름 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>메뉴 이름</div>
          <input
            className={styles.inputField}
            type="text"
            value={recipe.title}
            onChange={e => updateTitle(e.target.value)}
            placeholder="입력하세요" />
        </div>

        {/* 재료 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>재료</div>
          {recipe.ingredients.map((ing, idx) => (
            <div key={idx} className={styles.stepWrapper}>
              <HiMiniXCircle className={styles.removeIcon} onClick={() => removeIngredient(idx)} />
              <div className={styles.ingredientRow}>
                <input
                  type="text"
                  value={ing.name}
                  onChange={e => updateIngredient(idx, 'name', e.target.value)}
                  placeholder="재료명 (예: 양파)"
                  className={{ ...styles.inputField, ...styles.ingredientNameField }}
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                  placeholder="양 (예: 1개, 100g)"
                  className={{ ...styles.inputField, ...styles.ingredientAmountField }}
                />
              </div>
            </div>
          ))}
          {/* 재료 추가 버튼 */}
          <button className={styles.addButton} onClick={addIngredient}>+ 재료 추가</button>
        </div>

        {/* 설명 라벨 */}
        <div className={styles.descriptionSection}>
          <div className={styles.descriptionLabel}>조리 순서를 등록해주세요 :)</div>
        </div>

        {/* 동적 조리 단계 */}
        <div className={styles.stepsSection}>
          {steps.map((step, idx) => (
            <div key={step.id} className={styles.stepWrapper}>
              <HiMiniXCircle className={styles.removeIcon} onClick={() => removeStep(step.id)} />
              <div className={styles.stepCard}>
                <label className={styles.photoLabel}>
                  <input
                    type="file"
                    className={styles.photoInput}
                    onChange={e => updateFile(step.id, e.target.files[0])}
                  />
                  {step.file ? (
                    <img
                      src={URL.createObjectURL(step.file)}
                      alt="step"
                      className={styles.photoPreview}
                    />
                  ) : (
                    <HiPhoto size={28} className={styles.stepIcon} />
                  )}
                </label>
                <input
                  className={styles.stepInput}
                  type="text"
                  placeholder="조리 순서 설명"
                  value={step.desc}
                  onChange={e => updateDesc(step.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 단계 추가 버튼 */}
        <button className={styles.addButton} onClick={addStep}>+ 단계 추가</button>
        <div className={styles.margin2}></div>
        {/* 다음 버튼 */}
        <button className={styles.submitButton} onClick={handleSubmit}>
          다음<HiChevronRight className={styles.nextIcon} />
        </button>
        <div className={styles.margin}></div>
      </div>
    </div>
  );
};

export default RecipeRegister;
