// @GetMapping("/oauth/kakao/callback")//인가코드 발급
//     public void callbackKakao(
//             @RequestParam("code") String code
//             , HttpServletResponse response) throws IOException {

//         System.out.println(code);
//         String accessTokenFromKakao = kakaoLoginService.getAccessTokenFromKakao(code);

//         String redirectUrl = "http://{배포 서버 ip}/inputInfo?token=" + accessTokenFromKakao;

//         response.sendRedirect(redirectUrl);
//     }
