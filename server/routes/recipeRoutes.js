import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  toggleLike,
  getRecipesWithUserInfo,
  getRecipeComments,
  addComment
} from '../controllers/recipeController.js';

const router = express.Router();

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

// 레시피 등록
router.post('/', upload.any(), createRecipe);

// 전체 레시피 목록 조회
router.get('/', getRecipes);

// 특정 레시피 조회
router.get('/:recipeId', getRecipeById);

// 레시피 좋아요 토글
router.patch("/:recipeId/like", toggleLike);

// 사용자 ID로 등록된 레시피 조회
router.get("/user/:userId", getRecipesWithUserInfo);

// 레시피 댓글 조회
router.get("/:recipeId/comments", getRecipeComments);

// 레시피 댓글 추가
router.post("/:recipeId/comment", addComment);

export default router;