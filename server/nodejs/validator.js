const connect = require("./connect");

async function run() {
  try {
    const { db, client } = await connect();
    console.log("connected");

    //Users
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "nickname", "is_auth", "item_num", "recipe_num", "review_num"],
          properties: {
            id: { bsonType: "string" },
            nickname: { bsonType: "string" },
            is_auth: { bsonType: ["bool", "string"] },
            item_num: { bsonType: "int" },
            recipe_num: { bsonType: "int" },
            review_num: { bsonType: "int" }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    //Products
    await db.command({
      collMod: "products",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["item_id", "user_id", "name", "type", "pic", "reserve_end", "info", "price", "created_at"],
          properties: {
            item_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            name: { bsonType: "string" },
            type: { bsonType: "string" },
            pic: { bsonType: "string" },
            reserve_end: { bsonType: "date" },
            info: { bsonType: "string" },
            price: { bsonType: "int" },
            created_at: { bsonType: "date" }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    //Recipes
    await db.command({
      collMod: "recipes",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["recipe_id", "user_id", "name", "text", "pics", "view_cnt", "like_cnt", "comment_cnt", "comments", "created_at"],
          properties: {
            recipe_id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            name: { bsonType: "string" },
            text: { bsonType: "string" },
            pics: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            view_cnt: { bsonType: "int" },
            like_cnt: { bsonType: "int" },
            comment_cnt: { bsonType: "int" },
            comments: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["writer", "content", "timestamp"],
                properties: {
                  writer: { bsonType: "string" },
                  content: { bsonType: "string" },
                  timestamp: { bsonType: "string" } // ISO string
                }
              }
            },
            created_at: { bsonType: "date" }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    //Orders
    await db.command({
      collMod: "orders",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["order_id", "buyer_id", "seller_id", "item_id", "status", "timestamp", "price"],
          properties: {
            order_id: { bsonType: "string" },
            buyer_id: { bsonType: "string" },
            seller_id: { bsonType: "string" },
            item_id: { bsonType: "string" },
            status: { bsonType: "string" },
            timestamp: { bsonType: "date" },
            price: { bsonType: "int" }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    //Reviews
    await db.command({
      collMod: "reviews",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["review_id", "item_id", "writer_id", "content", "rating", "timestamp"],
          properties: {
            review_id: { bsonType: "string" },
            item_id: { bsonType: "string" },
            writer_id: { bsonType: "string" },
            content: { bsonType: "string" },
            rating: { bsonType: ["string", "int"] },
            timestamp: { bsonType: "date" }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    console.log("validator set");
  } catch (err) {
    console.error("error :", err);
  } finally {
    //await client.close();
    console.log("finished");
    
  }
    
}

run();
