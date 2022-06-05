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
} from "../../controllers/user.controllers/create_delete_user.controller";

import { Router } from "express";
import { UserRequest } from "../../types/express";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";

const router = Router();

/**
 * @swagger
 * paths:
 *   /users:
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
 *          "201":
 *            description: "사용자 생성 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "403":
 *            description: "SIGNUP AUTH FAILED : 이메일 인증을 하지않음"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / WRITE IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *          "409":
 *            description: "DUPLICATE NICKNAME OR EMAIL : 이미 유일값을 가진 유저가 존재"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /auth-mails:
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
 *          "201":
 *            description: "인증메일 전송 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / MAIL ERROR : 이메일 처리 중 에러 발생 (반환되는 경우 없어야함)"
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
 *       photo:
 *         type: string
 *         description: 사용자 프로필사진 (없다면 "")
 *         example: "aaa"
 *       location:
 *         type: string
 *         description: 사용자 주소 (없다면 "")
 *         example: "수원"
 */

router.post("/users", (req: UserRequest<CreateUserModel>, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user: CreateUserReqDTO = req.body;
  if (
    checkEmptyValue(user.email) ||
    checkEmptyValue(user.pw) ||
    checkEmptyValue(user.nickName)
  ) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "PARAMETER IS EMPTY",
    });
  }
  creatUser(user, res);
});

router.post("/auth-mails", (req: UserRequest<SendAuthEmailModel>, res) => {
  // 회원가입 시 인증
  // client에게서 받은 email로
  // 인증번호 담은 인증메일 전송
  const email: string = req.body.email;
  if (checkEmptyValue(email)) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "PARAMETER IS EMPTY",
    });
  }
  sendAuthEmail(email, res);
});

router.post("/users/auth", (req: UserRequest<CompareAuthEmailModel>, res) => {
  // 회원가입 시 인증
  // client에게서 받은 인증번호와
  // 발급한 인증번호를 비교
  // 동일하면 인증 완료
  const email: string = req.body.email;
  const authString: string = req.body.authCode;
  if (checkEmptyValue(email) || checkEmptyValue(authString)) {
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "PARAMETER IS EMPTY",
    });
  }
  compareAuthEmail(email, authString, res);
});

export default router;
