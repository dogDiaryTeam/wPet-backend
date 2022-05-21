import {
  CompareAuthEmailModel,
  CreateUserModel,
  CreateUserReqDTO,
  FindPwModel,
  LoginUserModel,
  SendAuthEmailModel,
  UpdatePwModel,
  UpdateUserModel,
  UpdateUserReqDTO,
  UserInforDTO,
} from "../../types/user";
import {
  compareAuthEmail,
  creatUser,
  sendAuthEmail,
  test,
} from "../../controllers/user.controllers/create_delete_user.controller";

import { Router } from "express";
import { UserRequest } from "../../types/express";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

/**
 * @swagger
 * paths:
 *   /api/user/create:
 *     post:
 *        tags:
 *        - users
 *        description: "사용자 생성하기"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/User_create_req"
 *        responses:
 *          "200":
 *            description: "사용자 생성 성공"
 *          "400":
 *            description: "사용자 생성 실패"
 *          "403":
 *            description: "이메일 인증을 하지않음"
 *          "409":
 *            description: "이미 유일값을 가진 유저가 존재"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/sendauthemail:
 *     post:
 *        tags:
 *        - users
 *        description: "(이메일 인증) 인증번호 메일 전송"
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
 *            description: "인증메일 전송 성공"
 *          "400":
 *            description: "이메일 형식이 유효하지 않습니다."
 *          "500":
 *            description: "서버 내의 문제 발생."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/compareauthemail:
 *     post:
 *        tags:
 *        - users
 *        description: "(이메일 인증) 인증번호 동일한지 확인"
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
 *                  - authString
 *                properties:
 *                  email:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "test1@naver.com"
 *                  authString:
 *                    type: string
 *                    description: 사용자가 입력한 인증번호
 *                    example: "zz9llj3auf"
 *        responses:
 *          "200":
 *            description: "인증 성공"
 *          "400":
 *            description: "요청 형식이 유효하지 않음."
 *          "401":
 *            description: "인증번호가 일치하지 않음."
 *          "404":
 *            description: "부여된 인증번호가 없음."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   User_create_req:
 *     type: object
 *     required:
 *       - email
 *       - pw
 *       - nickName
 *       - profilePicture
 *     properties:
 *       email:
 *         type: string
 *         description: 사용자 이메일 주소
 *         example: "test1@naver.com"
 *       pw:
 *         type: string
 *         description: 사용자 비밀번호(8-13자)
 *         example: "1111aaaa"
 *       nickName:
 *         type: string
 *         description: 사용자 닉네임(1-15자)
 *         example: "수민"
 *       profilePicture:
 *         type: string
 *         description: 사용자 프로필사진
 *         example: "aaa"
 *       location:
 *         type: string
 *         description: 사용자 주소
 *         example: "수원"
 */

router.post("/api/user/test", test);

router.post("/api/user/create", (req: UserRequest<CreateUserModel>, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user: CreateUserReqDTO = req.body;
  console.log("🚀 ~ user", user);
  console.log("🚀 ~ req.body", req.body);
  if (
    checkEmptyValue(user.email) ||
    checkEmptyValue(user.pw) ||
    checkEmptyValue(user.nickName)
  ) {
    return res.status(400).json({
      success: false,
      message: "PARAMETER IS EMPTY",
    });
  }
  creatUser(user, res);
});

router.post(
  "/api/user/sendauthemail",
  (req: UserRequest<SendAuthEmailModel>, res) => {
    // 회원가입 시 인증
    // client에게서 받은 email로
    // 인증번호 담은 인증메일 전송
    const email: string = req.body.email;
    console.log("🚀 ~ email", email);
    if (checkEmptyValue(email)) {
      return res.status(400).json({
        success: false,
        message: "PARAMETER IS EMPTY",
      });
    }
    sendAuthEmail(email, res);
  }
);

router.post(
  "/api/user/compareauthemail",
  (req: UserRequest<CompareAuthEmailModel>, res) => {
    // 회원가입 시 인증
    // client에게서 받은 인증번호와
    // 발급한 인증번호를 비교
    // 동일하면 인증 완료
    const email: string = req.body.email;
    const authString: string = req.body.authString;
    console.log("🚀 ~ email", email);
    if (checkEmptyValue(email) || checkEmptyValue(authString)) {
      return res.status(400).json({
        success: false,
        message: "PARAMETER IS EMPTY",
      });
    }
    compareAuthEmail(email, authString, res);
  }
);

export default router;
