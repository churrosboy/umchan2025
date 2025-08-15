// routes/geocode.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

console.log("Client ID:", process.env.NAVER_CLIENT_ID);
console.log("Client Secret:", process.env.NAVER_CLIENT_SECRET);


router.get('/', async (req, res) => {
  const { address } = req.query;
  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'x-ncp-apigw-api-key-id': process.env.NAVER_CLIENT_ID,
        'x-ncp-apigw-api-key': process.env.NAVER_CLIENT_SECRET,
        'Accept': 'application/json'
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Geocoding 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

export default router;