import express from "express";
import { getUserById, searchUsersByProduct, searchSellers } from "../controllers/userContoroller.js";

const router = express.Router();

// 사용자 ID로 조회
router.get("/:id", getUserById);

// 인증된 사용자 중 검색어에 해당하는 상품을 가진 사용자 검색
router.get("/search/product", searchUsersByProduct);

// 사용자중 인증된 사용자만 조회
router.get("/sellers", searchSellers);

export default router;