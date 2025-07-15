const connect = require("./connect");

async function run() {
  try {
    const { db, client } = await connect();
    console.log("✅ MongoDB 연결 완료");

    const targetCollections = ["users", "products", "recipes", "orders", "reviews"];

    for (const name of targetCollections) {
      const result = await db.listCollections({ name }).toArray();
      const validator = result[0]?.options?.validator;

      if (validator) {
        console.log(`✅ [${name}] 컬렉션: validator 설정됨`);
        console.dir(validator, { depth: null });
      } else {
        console.log(`⚠️ [${name}] 컬렉션: validator 없음`);
      }
    }

  } catch (err) {
    console.error("❌ validator 확인 중 오류:", err);
  } finally {
    console.log("🔌 MongoDB 연결 종료");
  }
}

run();