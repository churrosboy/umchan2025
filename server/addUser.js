import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/Users.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const newUser = {
      id: 1,
      nickname: "테스트유저",
      is_auth: true,
      item_num: 5,
      recipe_num: 2,
      review_num: 1,
      location: {
        type: "Point",
        coordinates: [127.0276, 37.4979] // [경도, 위도]
      },
      avg_rating: 4.5,
      review_cnt: 10,
      like_cnt: 3,
      instant_cnt: 2,
      reserve_cnt: 1,
      profile_img: "profile.jpg",
      main_img: ["main1.jpg", "main2.jpg"],
      phone_num: "010-1234-5678",
      address: "서울특별시 강남구",
      disc: "테스트 유저 설명입니다."
    };

    const user = new User(newUser);
    await user.save();
    console.log("유저 추가 성공:", user);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("유저 추가 실패:", err);
  });