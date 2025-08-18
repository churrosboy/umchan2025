import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as recipeController from '../controllers/recipeController.js';

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const router = express.Router();

// 레시피 등록
router.post('/', upload.any(), recipeController.createRecipe);

// 전체 레시피 목록 조회
router.get('/', recipeController.getRecipes);

// 특정 레시피 조회
router.get('/:recipeId', recipeController.getRecipeById);

// 레시피 좋아요 토글
router.patch("/:recipeId/like", recipeController.toggleLike);

// 사용자 ID로 등록된 레시피 조회
router.get("/user/:userId", recipeController.getRecipesWithUserInfo);

// 레시피 댓글 조회
router.get("/:recipeId/comments", recipeController.getRecipeComments);

// 레시피 댓글 추가
router.post("/:recipeId/comment", recipeController.addComment);

export default router;