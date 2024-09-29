const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000", // 허용할 프론트엔드 도메인
  })
);

// 카카오 로그인 인증 코드 처리 API
app.post("/api/auth/kakao/callback", async (req, res) => {
  const { code } = req.body;

  const kakaoClientId = process.env.KAKAO_CLIENT_ID;
  const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  try {
    const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: kakaoClientId,
          client_secret: kakaoClientSecret,
          redirect_uri: redirectUri,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = userResponse.data;

    res.json({ user: userData });
    console.log("로그인 성공");
  } catch (error) {
    console.error("카카오 로그인 실패:", error.response?.data || error.message);
    res.status(500).json({ message: "카카오 로그인 실패" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
