import Recipe from "../models/Recipe.js";

// 레시피 목록 조회
export async function getRecipes(req, res) {
  try {
    const { keyword } = req.query;
    let query = {};

    if (keyword && keyword.trim() !== "") {
      query.title = { $regex: keyword, $options: 'i' };
    }

    const recipes = await Recipe.find(query);
    res.status(200).json(recipes);
  } catch (err) {
    console.error("❌ 레시피 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 레시피 상세 조회
export async function getRecipeById(req, res) {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findOne({ recipe_id: recipeId });

    if (!recipe) {
      return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
    }

    res.status(200).json(recipe);
  } catch (err) {
    console.error("❌ 레시피 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 레시피 등록
export async function createRecipe(req, res) {
  try {
    console.log('=== Recipe 등록 요청 ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // 필수 필드 검증
    const { user_id, name, text, ingredients } = req.body;
    
    if (!name || !name.trim()) {
      console.log('❌ 레시피 이름이 없습니다.');
      return res.status(400).json({ success: false, error: '레시피 이름이 필요합니다.' });
    }
    
    console.log('✅ 필수 필드 검증 통과');
    console.log('Extracted fields:', { user_id, name, text, ingredients });
    
    // 이미지 경로 처리
    let thumbnail = '';
    let steps = [];
    
    if (req.files && req.files.length > 0) {
      console.log(`📁 ${req.files.length}개의 파일 처리 시작`);
      
      req.files.forEach(file => {
        console.log('File received:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          filename: file.filename
        });
        
        if (file.fieldname === 'mainImage') {
          thumbnail = `/uploads/${file.filename}`;
          console.log('📷 Main image:', thumbnail);
        } else if (/^stepImage\d+$/.test(file.fieldname)) {
          const idx = parseInt(file.fieldname.replace('stepImage', ''));
          if (!steps[idx]) steps[idx] = {};
          steps[idx].img = `/uploads/${file.filename}`;
          console.log(`📷 Step ${idx} image:`, steps[idx].img);
        }
      });
    } else {
      console.log('📁 업로드된 파일이 없습니다.');
    }
    
    // stepDescN 처리
    console.log('📝 단계 설명 처리 시작');
    /*
    Object.keys(req.body).forEach(key => {
      if (/^stepDesc\d+$/.test(key)) {
        const idx = parseInt(key.replace('stepDesc', ''));
        if (!steps[idx]) steps[idx] = {};
        steps[idx].text = req.body[key];
        steps[idx].step_num = idx + 1;
        console.log(`📝 Step ${idx} description:`, steps[idx].text);
      }
    });
    */
   /*
    if (Array.isArray(req.body.steps)) {
      console.log('✅ Steps array found:', req.body.steps);
      validSteps = req.body.steps.filter(
        s => s && typeof s.text === 'string' && s.text.trim()
      );
    } else {
      console.log('❌ No steps array found, req.body:', req.body);
      validSteps = [];
    }
      */
    
    console.log('Generated steps before filter:', steps);
    
    // ingredients 파싱
    let parsedIngredients = [];
    if (typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (err) {
        parsedIngredients = [];
      }
    } else if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients;
    }
    
    let validSteps = [];

    if(req.body.steps) {
      try {
        // steps가 객체면 그대로, 문자열이면 파싱
        const parsedSteps = typeof req.body.steps === 'string'
          ? JSON.parse(req.body.steps)
          : req.body.steps;

        validSteps = parsedSteps.filter(step => step.text && step.text.trim()).map((step, idx) => ({
          ...step,
          step_num: idx + 1,
          img: steps[idx] ? `${steps[idx].img}` : ''
        }));

        console.log('✅ Parsed and validated steps:', validSteps);
      } catch (err) {
        console.error('❌ Steps parsing error:', err);
        return res.status(400).json({ success: false, error: 'Invalid steps format' });
      }
    } else {
      console.log('❌ No steps array found in request body');
      validSteps = [];
    }
    
    console.log('✅ Valid steps:', validSteps);
    
    // 반드시 steps가 1개 이상 있어야 함
    if (!validSteps.length) {
      console.log('❌ No valid steps found!');
      return res.status(400).json({ 
        success: false, 
        error: "조리 단계가 최소 1개 이상 필요합니다." 
      });
    }
    
    const recipeData = {
      user_id: parseInt(user_id) || 123,
      title: name.trim(),
      desc: text ? text.trim() : '',
      thumbnail,
      ingredients: parsedIngredients,
      steps: validSteps,
    };
    
    console.log('🔄 Creating recipe with data:', recipeData);
    
    // Recipe 인스턴스 생성 및 저장
    const recipe = new Recipe(recipeData);
    console.log('🔄 Recipe instance created, saving...');
    
    const savedRecipe = await recipe.save();
    console.log('✅ Recipe saved successfully:', savedRecipe);
    
    res.status(201).json({ success: true, recipe: savedRecipe });
    
  } catch (err) {
    console.error('❌ Recipe creation error:', err);
    console.error('❌ Error stack:', err.stack);
    
    // 구체적인 에러 처리
    if (err.name === 'ValidationError') {
      console.error('❌ Validation Error details:', err.errors);
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message
        }))
      });
    }
    
    if (err.code === 11000) {
      console.error('❌ Duplicate key error:', err.keyValue);
      return res.status(409).json({ 
        success: false, 
        error: 'Recipe ID already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

// 레시피 좋아요 토글
export async function toggleLike(req, res) {
  try {
    const { recipeId } = req.params;
    const { liked } = req.body;

    const recipe = await Recipe.findOne({ recipe_id: recipeId });

    if (!recipe) {
      return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
    }

    recipe.like_cnt = liked ? recipe.like_cnt + 1 : recipe.like_cnt - 1;
    await recipe.save();

    res.status(200).json({ message: "좋아요 상태 변경 완료", recipe });
  } catch (err) {
    console.error("❌ 좋아요 상태 변경 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 사용자 ID로 레시피 조회
export async function getRecipesByUserId(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id 쿼리 파라미터가 필요합니다." });
    }

    const recipes = await Recipe.find({ user_id: Number(user_id) });

    if (!recipes.length) {
      return res.status(404).json({ error: "사용자가 등록한 레시피를 찾을 수 없습니다." });
    }

    res.status(200).json(recipes);
  } catch (err) {
    console.error("❌ 사용자 ID로 레시피 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 사용자 정보 포함 레시피 조회
export async function getRecipesWithUserInfo(req, res) {
  try {
    const { userId } = req.params;

    const recipes = await Recipe.aggregate([
      { $match: { user_id: Number(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "id",
          as: "user_info"
        }
      }
    ]);

    if (!recipes.length) {
      return res.status(404).json({ error: "사용자가 등록한 레시피를 찾을 수 없습니다." });
    }

    res.status(200).json(recipes);
  } catch (err) {
    console.error("❌ 레시피 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 레시피 댓글 조회
export async function getRecipeComments(req, res) {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findOne({ recipe_id: recipeId });
    if (!recipe) {
      return res.status(404).json([]);
    }
    res.json(recipe.comments || []);
  } catch (err) {
    console.error("❌ 댓글 조회 실패:", err);
    res.status(500).json([]);
  }
}

// 레시피 댓글 추가
export async function addComment(req, res) {
  try {
    const { recipeId } = req.params;
    const { writer, content } = req.body;

    if (!writer || !content) {
      return res.status(400).json({ error: "writer와 content가 필요합니다." });
    }

    const recipe = await Recipe.findOne({ recipe_id: recipeId });
    if (!recipe) {
      return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
    }

    const comment = {
      writer,
      content,
      timestamp: new Date().toISOString()
    };

    recipe.comments.push(comment);
    recipe.comment_cnt = recipe.comments.length;
    await recipe.save();

    res.status(201).json({ message: "댓글이 추가되었습니다.", comments: recipe.comments });
  } catch (err) {
    console.error("❌ 댓글 추가 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

