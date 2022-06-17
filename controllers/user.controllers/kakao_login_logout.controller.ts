import { KakaoUserDTO } from "../../types/kakao";
import { Response } from "express-serve-static-core";
import { dbFindKakaoUser } from "../../db/user.db/kakao_login_logout_user.db";

export const kakaoLogin = (
  user: KakaoUserDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // user가 db에 있는지 검증
  dbFindKakaoUser(user.userID, function (success, err, isUser) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (!isUser) {
      // 유저 없음
      // 회원가입 -> 자동 로그인?
    } else if (user) {
      // 유저 있음
      // 자동 로그인 (token 발급)
    }
  });
};
