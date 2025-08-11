// 레시피 라우트 정의
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const recipeController = require('../controllers/recipeController');

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 해결 방법 1: upload.any() 사용 (모든 필드명 허용)
router.post('/', upload.any(), recipeController.createRecipe);

// 전체 레시피 목록 조회
router.get('/', recipeController.getRecipes);

// 특정 레시피 조회
router.get('/:recipeId', recipeController.getRecipeById);

router.patch("/:recipeId/like", recipeController.toggleLike);

// 사용자 ID로 등록된 레시피 조회
router.get("/user/:userId", recipeController.getRecipesWithUserInfo);

router.get("/:recipeId/comments", recipeController.getRecipeComments);

router.post("/:recipeId/comment", recipeController.addComment);

module.exports = router;