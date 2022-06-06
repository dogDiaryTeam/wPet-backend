import {
  CompareAuthUpdateEmailModel,
  SendAuthUpdateEmailModel,
  UpdatePwModel,
  UpdateUserModel,
  UpdateUserReqDTO,
  UserInforDTO,
} from "../../types/user";
import {
  compareAuthUserUpdateEmail,
  sendAuthUserUpdateEmail,
  updateUser,
  updateUserPw,
} from "../../controllers/user.controllers/infor_user.controller";

import { Router } from "express";
import { UserRequest } from "../../types/express";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { dbSelectPictureFile } from "../../controllers/image.controllers/image.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /users/auth:
 *     post:
 *        tags:
 *        - users
 *        description: "(이메일 인증) 인증번호 동일한지 확인 -> 동일하다면 이메일 인증 완료 (로그인 가능)"
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
 *                  - authCode
 *                properties:
 *                  email:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "test1@naver.com"
 *                  authCode:
 *                    type: string
 *                    description: 사용자가 입력한 인증번호 (8자리)
 *                    example: "sbsrb1u0"
 *        responses:
 *          "201":
 *            description: "인증 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH CODE IS MISMATCH : 인증번호가 일치하지 않음."
 *          "404":
 *            description: "AUTH TIMEOUT : 인증번호 시간 초과 / (SQL ERROR : DB 에러 (반환되는 경우 없어야함))"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *     get:
 *        tags:
 *        - users
 *        description: "현재 로그인 되어있는 사용자 정보 가져오기."
 *        produces:
 *        - applicaion/json
 *        responses:
 *          "200":
 *            description: "사용자 인증 성공"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/UserInfor'
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "NOT FOUND : 이미지 파일을 찾을 수 없음 (반환되는 경우 없어야함))"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *     patch:
 *        tags:
 *        - users
 *        description: "현재 로그인 되어있는 사용자의 정보 수정 (수정할 정보 하나씩만 요청)"
 *        produces:
 *        - applicaion/json
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  nickName:
 *                    type: string
 *                    description: 수정할 사용자 닉네임
 *                    example: "수민2"
 *                  photo:
 *                    type: string
 *                    description: 수정할 사용자 프로필사진
 *                    example: "bbb"
 *                  location:
 *                    type: string
 *                    description: 수정할 사용자 지역
 *                    example: "서울"
 *        responses:
 *          "201":
 *            description: "사용자 정보 수정 성공"
 *          "204":
 *            description: "기존의 사용자 정보와 수정할 정보가 같음 (수정X) (no content -> 아무 메시지도 반환x)"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자가 존재하지 않음 / WRITE(DELETE) IMAGE FILE ERROR : 이미지 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *          "409":
 *            description: "DUPLICATE NICKNAME : 수정할 닉네임이 이미 존재함"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /users/auth/pw:
 *     put:
 *        tags:
 *        - users
 *        description: "현재 로그인 되어있는 사용자의 비밀번호 수정"
 *        produces:
 *        - applicaion/json
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - oldPw
 *                  - newPw
 *                properties:
 *                  oldPw:
 *                    type: string
 *                    description: 기존의 사용자 비밀번호
 *                    example: "1111111a"
 *                  newPw:
 *                    type: string
 *                    description: 수정할 사용자 비밀번호
 *                    example: "1111111b"
 *        responses:
 *          "201":
 *            description: "사용자 비밀번호 수정 성공"
 *          "204":
 *            description: "기존의 사용자 비밀번호와 수정할 비밀번호가 같음 (수정X) (no content -> 아무 메시지도 반환x)"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패 / 비밀번호 틀림"
 *          "404":
 *            description: "SQL ERROR : DB 에러 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /update-mails:
 *     post:
 *        tags:
 *        - users
 *        description: "(이메일 수정) 수정할 이메일로 인증번호 발송"
 *        produces:
 *        - applicaion/json
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - newEmail
 *                properties:
 *                  newEmail:
 *                    type: string
 *                    description: 수정할 사용자 이메일
 *                    example: "updatetest@naver.com"
 *        responses:
 *          "201":
 *            description: "수정할 이메일로 인증 메일 전송 성공"
 *          "204":
 *            description: "기존의 사용자 이메일과 수정할 이메일이 같음 (수정X) (no content -> 아무 메시지도 반환x)"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / MAIL ERROR : 이메일 처리 중 에러 발생 (반환되는 경우 없어야함)"
 *          "409":
 *            description: "DUPLICATE EMAIL : 다른 회원과 이메일 중복"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /users/auth/email:
 *     put:
 *        tags:
 *        - users
 *        description: "(이메일 수정) 인증번호가 동일하면 사용자의 이메일 수정"
 *        produces:
 *        - applicaion/json
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - newEmail
 *                  - authCode
 *                properties:
 *                  newEmail:
 *                    type: string
 *                    description: 수정할 사용자 이메일
 *                    example: "updatetest@naver.com"
 *                  authCode:
 *                    type: string
 *                    description: 사용자가 입력한 인증번호 (8자리)
 *                    example: "sbsrb1u0"
 *        responses:
 *          "201":
 *            description: "사용자 이메일 수정 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패 / AUTH CODE IS MISMATCH : 인증번호가 일치하지 않음."
 *          "404":
 *            description: "AUTH TIMEOUT : 인증번호 시간 초과 / (SQL ERROR : DB 에러 (반환되는 경우 없어야함))"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   UserInfor:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         description: 사용자 이메일 주소
 *         example: "test4@naver.com"
 *       joinDate:
 *         type: string
 *         description: 사용자 회원가입 날짜
 *         example: "2022-05-09"
 *       nickName:
 *         type: string
 *         description: 사용자 닉네임(1-15자)
 *         example: "sumin"
 *       photo:
 *         type: string
 *         description: 사용자 프로필사진
 *         example: "bbb"
 *       location:
 *         type: string
 *         description: 사용자 주소
 *         example: "경기"
 */

//middleware
router.get("/users/auth", auth, (req, res) => {
  //middleware를 통해 얻은 유저 정보를 반환한다.
  //인증 완료
  let user: UserInforDTO | null = req.user;
  //후에 디벨롭
  //role:0 -> 일반인
  //role:1,2.... -> 관리자
  if (user) {
    // 사용자 사진 가져오기
    dbSelectPictureFile(user.photo, function (success, result, error, msg) {
      if (!success && error) {
        return res
          .status(404)
          .json({ code: "FIND IMAGE FILE ERROR", errorMessage: error });
      }
      // 파일이 없는 경우
      else if (!success && !error) {
        return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
      }
      // 파일에서 이미지 데이터 가져오기 성공
      else if (user) {
        let userImage: string | null = result;
        return res.status(200).json({
          email: user.email,
          joinDate: user.joinDate,
          nickName: user.nickName,
          photo: userImage,
          location: user.location,
        });
      }
    });
  } else {
    //유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.patch("/users/auth", auth, (req: UserRequest<UpdateUserModel>, res) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저 정보를 수정한다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    let userID: number = user.userID;
    let userNickName: string = user.nickName;
    let userProfilePicture: string | null = user.photo;
    let userLocation: string | null = user.location;
    //object
    const param: UpdateUserReqDTO = req.body;
    // test 필요
    if (checkEmptyValue(param)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    } else if (param.nickName && checkEmptyValue(param.nickName))
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });

    updateUser(
      userID,
      userNickName,
      userProfilePicture,
      userLocation,
      param,
      res
    );
  } else {
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.put("/users/auth/pw", auth, (req: UserRequest<UpdatePwModel>, res) => {
  //비밀번호 변경 (로그인 된 상태)
  //현재 비밀번호 + auth + 새 비밀번호
  let user: UserInforDTO | null = req.user;

  if (user) {
    const originPw: string = req.body.oldPw;
    const newPw: string = req.body.newPw;
    if (checkEmptyValue(originPw) || checkEmptyValue(newPw)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    updateUserPw(originPw, newPw, user.userID, res);
  } else {
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.post(
  "/update-mails",
  auth,
  (req: UserRequest<SendAuthUpdateEmailModel>, res) => {
    //이메일 변경 (로그인 된 상태)
    // 새 이메일 + auth
    let user: UserInforDTO | null = req.user;

    if (user) {
      const newEmail: string = req.body.newEmail;

      if (checkEmptyValue(newEmail)) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }
      sendAuthUserUpdateEmail(user.userID, user.email, newEmail, res);
    } else {
      return res.status(401).json({
        code: "AUTH FAILED",
        errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
      });
    }
  }
);

router.put(
  "/users/auth/email",
  auth,
  (req: UserRequest<CompareAuthUpdateEmailModel>, res) => {
    //이메일 변경 (로그인 된 상태)
    // 새 이메일 + auth
    let user: UserInforDTO | null = req.user;

    if (user) {
      const newEmail: string = req.body.newEmail;
      const authString: string = req.body.authCode;

      if (checkEmptyValue(newEmail) || checkEmptyValue(authString)) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }
      compareAuthUserUpdateEmail(user.userID, newEmail, authString, res);
    } else {
      return res.status(401).json({
        code: "AUTH FAILED",
        errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
      });
    }
  }
);

export default router;
