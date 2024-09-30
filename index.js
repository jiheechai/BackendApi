const express = require("express");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
const PORT = 5000;
require("dotenv").config();

const app = express();
app.use(express.json());
// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000", // 허용할 프론트엔드 도메인
    credentials: true, // 쿠키를 포함한 요청 허용
  })
);
// 세션 미들웨어 설정
app.use(
  session({
    secret: process.env.KAKAO_CLIENT_SECRET, // 세션 암호화에 사용할 비밀 키
    resave: false, // 세션이 수정되지 않아도 다시 저장할지 여부
    saveUninitialized: true, // 세션이 필요하기 전까지는 세션을 구동하지 않음
    cookie: { secure: false }, // HTTPS에서는 true로 설정 (테스트 환경에서는 false)
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

    //액세스 토큰으로 사용자 정보 요청
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = userResponse.data;
    //세션에 로그인정보 저장
    req.session.user = userData;
    console.log("저장된 세션 정보1:", req.session.user);

    res.json({ user: userData });

    console.log("로그인 성공");
  } catch (error) {
    console.error("카카오 로그인 실패:", error.response?.data || error.message);
    res.status(500).json({ message: "카카오 로그인 실패" });
  }
});
// 세션 정보를 통해 로그인 상태 확인
app.get("/auth/session", (req, res) => {
  console.log("저장된 세션 정보2:", req.session.user);
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});
// 로그아웃 API
app.post("/auth/logout", (req, res) => {
  // 세션을 삭제하여 로그아웃 처리
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "로그아웃 실패" });
    }
    res.clearCookie("connect.sid"); // 세션 쿠키 삭제
    res.json({ message: "로그아웃 성공" });
    // 세션 삭제 후 로그 확인
    console.log("로그아웃 후 세션 정보:", req.session); // 이 시점에서는 req.session이 undefined가 되어야 합니다.
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
