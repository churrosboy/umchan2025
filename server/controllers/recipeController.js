import fs from 'fs';
import Recipe from "../models/Recipe.js";
import admin from "../firebaseAdmin.js";

// Bearer 토큰 파싱 함수
function parseBearer(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // 'Bearer ' 이후 부분
}

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

    /////////////////////////////////////////////////////////////////////////////

    // 인증 검증 로직
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: "No token" });

    let uid;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      return res.status(401).json({ error: "Invalid token" });
    }

    /////////////////////////////////////////////////////////////////////////////
    
    if (!name || !name.trim()) {
      console.log('❌ 레시피 이름이 없습니다.');
      return res.status(400).json({ success: false, error: '레시피 이름이 필요합니다.' });
    }
    
    console.log('✅ 필수 필드 검증 통과');
    console.log('Extracted fields:', { user_id, name, text, ingredients });
    
    // 이미지 경로 처리
    let thumbnail = '';
    let steps = [];
    
    // Promise 배열을 만들어 모든 파일 업로드 작업을 추적
    const uploadPromises = [];
    
    if (req.files && req.files.length > 0) {
      console.log(`📁 ${req.files.length}개의 파일 처리 시작`);
      
      req.files.forEach(imgfile => {
        console.log('File received:', {
          fieldname: imgfile.fieldname,
          originalname: imgfile.originalname,
          filename: imgfile.filename
        });

        // 각 파일 업로드를 Promise로 처리
        const uploadPromise = (async () => {
          try {
            const bucket = admin.storage().bucket();

            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            const destination = imgfile.fieldname === 'mainImage' 
              ? `recipe/profile_images/${uid}_${timestamp}_${randomId}` 
              : `recipe/step_images/${uid}_${timestamp}_${randomId}`;

            // 로컬 파일 경로
            const filePath = imgfile.path;
            
            console.log(`업로드 시작: ${imgfile.fieldname}, 경로: ${filePath}`);

            // Firebase Storage에 업로드
            await bucket.upload(filePath, {
              destination: destination,
              metadata: {
                contentType: imgfile.mimetype,
                metadata: {
                  firebaseStorageDownloadTokens: uid // 토큰으로 사용자 ID 활용
                }
              }
            });

            // 업로드 후 공개 URL 생성
            const file = bucket.file(destination);
            const [metadata] = await file.getMetadata();

            // 파일 URL 생성
            const bucketName = bucket.name;
            const downloadToken = metadata.metadata.firebaseStorageDownloadTokens;
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
            
            // 임시 파일 삭제
            try {
              fs.unlinkSync(filePath);
              console.log(`임시 파일 삭제 성공: ${filePath}`);
            } catch (unlinkError) {
              console.error(`임시 파일 삭제 실패: ${filePath}`, unlinkError);
            }

            console.log(`업로드 완료: ${imgfile.fieldname}, URL: ${fileUrl}`);

            if (imgfile.fieldname === 'mainImage') {
              thumbnail = fileUrl;
              console.log('📷 Main image:', thumbnail);
            } else if (/^stepImage(\d+)$/.test(imgfile.fieldname)) {
              const idx = parseInt(imgfile.fieldname.replace('stepImage', ''));
              if (!steps[idx]) steps[idx] = {};
              steps[idx].img = fileUrl;
              console.log(`📷 Step ${idx+1} image:`, steps[idx].img);
            }
            
            return { fieldname: imgfile.fieldname, url: fileUrl };
          } catch (error) {
            console.error(`Firebase 업로드 오류 (${imgfile.fieldname}):`, error);
            return { error: true, fieldname: imgfile.fieldname };
          }
        })();
        
        uploadPromises.push(uploadPromise);
      });
    } else {
      console.log('📁 업로드된 파일이 없습니다.');
    }
    
    // 모든 파일 업로드가 완료될 때까지 기다림
    await Promise.all(uploadPromises);
    
    // 나머지 코드 (steps 및 ingredients 처리)는 동일
    console.log('📝 단계 설명 처리 시작');
    
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

        validSteps = parsedSteps.filter(step => step.text && step.text.trim()).map((step, idx) => {
          // 해당 단계에 이미지가 있으면 사용, 없으면 빈 문자열
          const stepImage = steps[idx] ? steps[idx].img : '';
          
          return {
            ...step,
            step_num: idx + 1,
            img: stepImage
          };
        });

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
      user_id: user_id,
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

