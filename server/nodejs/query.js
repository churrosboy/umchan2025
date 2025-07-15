const connect = require("./connect");

async function run() {
  try {
    const { db, client } = await connect(); // ✅ 구조분해 할당
    console.log("✅ MongoDB 연결 완료");

    // ✅ Users 컬렉션 생성 및 삽입
    await db.collection("users").insertOne({
      id: "user1",
      nickname: "맛잘알",
      is_auth: true,
      item_num: 2,
      recipe_num: 1,
      review_num: 3
    });

    // ✅ Products 컬렉션 생성 및 삽입
    await db.collection("products").insertOne({
      item_id: "item1",
      user_id: "user1",
      name: "수제 김치",
      type: "예약",
      pic: "http://example.com/image.jpg",
      reserve_end: new Date,
      info: "맛있는 수제 김치예요",
      price: 7000,
      created_at: new Date()
    });

    // ✅ Recipes 컬렉션 생성 및 삽입
    await db.collection("recipes").insertOne({
      recipe_id: "recipe1",
      user_id: "user1",
      name: "김치찌개 레시피",
      text: "김치를 볶고 물을 넣고...",
      pics: ["http://example.com/pic1.jpg"],
      view_cnt: 124,
      like_cnt: 12,
      comment_cnt: 2,
      comments: [
        {
          writer: "user2",
          content: "정말 맛있겠어요!",
          timestamp: new Date().toISOString()
        },
        {
          writer: "user3",
          content: "따라 만들어봤어요",
          timestamp: new Date().toISOString()
        }
      ],
      created_at: new Date()
    });

    // ✅ Orders 컬렉션 생성 및 삽입
    await db.collection("orders").insertOne({
      order_id: "order1",
      buyer_id: "user2",
      seller_id: "user1",
      item_id: "item1",
      status: "예약완료",
      timestamp: new Date(),
      price: 7000
    });

    // ✅ Reviews 컬렉션 생성 및 삽입
    await db.collection("reviews").insertOne({
      review_id: "review1",
      item_id: "item1",
      writer_id: "user2",
      content: "정말 맛있어요! 또 시킬게요.",
      rating: "5공기",
      timestamp: new Date()
    });

    console.log("✅ 데이터베이스 초기화 및 샘플 데이터 삽입 완료");
  } catch (err) {
    console.error("❌ 오류 발생:", err);
  } finally {
    await client.close();
    console.log("🔌 MongoDB 연결 종료");
  }
}

run();
