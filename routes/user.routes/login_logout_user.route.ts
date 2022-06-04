import { FindPwModel, LoginUserModel, UserInforDTO } from "../../types/user";
import {
  findUserPw,
  loginUser,
  logoutUser,
} from "../../controllers/user.controllers/login_logout_user.controller";

import { Router } from "express";
import { UserRequest } from "../../types/express";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

/**
 * @swagger
 * paths:
 *   /api/user/find/pw:
 *     post:
 *        tags:
 *        - users
 *        description: "(로그인 전) 사용자 비밀번호 찾기 => 임시 비밀번호를 담은 이메일 전송"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - email
 *                properties:
 *                  email:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "test1@naver.com"
 *        responses:
 *          "200":
 *            description: "임시 비밀번호를 담은 이메일 전송 성공"
 *          "400":
 *            description: "요청 데이터가 유효하지 않음."
 *          "404":
 *            description: "해당 이메일의 유저가 존재하지 않음."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/login:
 *     post:
 *        tags:
 *        - users
 *        description: "사용자 로그인 (쿠키 생성)"
 *        produces:
 *        - applicaion/json
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - email
 *                  - pw
 *                properties:
 *                  email:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "test4@naver.com"
 *                  pw:
 *                    type: string
 *                    description: 사용자 비밀번호(8-13자)
 *                    example: "1111111a"
 *        responses:
 *          "200":
 *            description: "사용자 로그인 성공"
 *          "400":
 *            description: "요청 데이터가 유효하지 않음."
 *          "401":
 *            description: "비밀번호 불일치"
 *          "403":
 *            description: "아직 이메일 인증을 하지 않음."
 *          "404":
 *            description: "이메일이 존재하지 않음"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/logout:
 *     get:
 *        tags:
 *        - users
 *        description: "사용자 로그아웃 (쿠키 삭제)"
 *        produces:
 *        - applicaion/json
 *        responses:
 *          "200":
 *            description: "사용자 로그아웃 성공"
 *          "400":
 *            description: "사용자 로그아웃 실패"
 *          "401":
 *            description: "사용자 인증 실패"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

router.post("/api/user/find/pw", (req: UserRequest<FindPwModel>, res) => {
  //비밀번호 찾기 시 인증
  //client에게서 받은 이메일로
  //임시 비밀번호를 제공 후, 비밀번호 update
  const email: string = req.body.email;
  if (checkEmptyValue(email)) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "PARAMETER IS EMPTY",
    });
  }
  findUserPw(email, res);
});

router.post("/api/user/login", (req: UserRequest<LoginUserModel>, res) => {
  //로그인 정보(email:uq, pw:uq)들을 client에서 가져오면
  //데이터베이스의 정보(email, pw)들과 비교해서
  //존재하는 유저라면 success=true
  const email: string = req.body.email;
  const pw: string = req.body.pw;
  if (checkEmptyValue(email) || checkEmptyValue(pw)) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "PARAMETER IS EMPTY",
    });
  }
  loginUser(email, pw, res);
});

//logout (login된 상태이기 때문에 auth를 넣어준다.)
router.get("/api/user/logout", auth, (req, res) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저를 로그아웃해준다. (token 제거)
  let user: UserInforDTO | null = req.user;
  if (user) {
    console.log("logout");

    logoutUser(user.userID, res);
  } else {
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
