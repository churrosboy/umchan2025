const express = require("express");
const router = express.Router();
const userController = require("../controllers/userContoroller.js");

// 사용자 ID로 조회
router.get("/:id", userController.getUserById);

// 인증된 사용자 중 검색어에 해당하는 상품을 가진 사용자 검색
router.get("/search/product", userController.searchUsersByProduct);

module.exports = router;