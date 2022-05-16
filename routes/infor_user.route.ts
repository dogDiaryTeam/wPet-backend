import {
  UpdatePwModel,
  UpdateUserModel,
  UpdateUserReqDTO,
  UserInforDTO,
} from "../types/user";
import { updateUser, updateUserPw } from "../controllers/infor_user.controller";

import { Router } from "express";
import { UserRequest } from "../types/express";
import { auth } from "../middleware/auth";
import { checkEmptyValue } from "../controllers/validate";
import { dbSelectPictureFile } from "../controllers/image.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /api/user/auth:
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
 *            description: "사용자 인증 실패"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/update:
 *     patch:
 *        tags:
 *        - users
 *        description: "현재 로그인 되어있는 사용자의 정보 수정 (수정할 정보만 요청)"
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
 *                  profilePicture:
 *                    type: string
 *                    description: 수정할 사용자 프로필사진
 *                    example: "bbb"
 *                  location:
 *                    type: string
 *                    description: 수정할 사용자 지역
 *                    example: "서울"
 *        responses:
 *          "200":
 *            description: "사용자 정보 수정 성공"
 *          "400":
 *            description: "요청 데이터가 유효하지 않음."
 *          "401":
 *            description: "사용자 인증 실패."
 *          "409":
 *            description: "수정할 이메일이 이미 존재함"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/updatepw:
 *     post:
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
 *                  - originPw
 *                  - newPw
 *                properties:
 *                  originPw:
 *                    type: string
 *                    description: 기존의 사용자 비밀번호
 *                    example: "1111111a"
 *                  newPw:
 *                    type: string
 *                    description: 수정할 사용자 비밀번호
 *                    example: "1111111b"
 *        responses:
 *          "200":
 *            description: "사용자 비밀번호 수정 성공"
 *          "400":
 *            description: "요청 데이터가 유효하지 않음."
 *          "401":
 *            description: "사용자 인증 실패 or 비밀번호 틀림."
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
 *       profilePicture:
 *         type: string
 *         description: 사용자 프로필사진
 *         example: "bbb"
 *       location:
 *         type: string
 *         description: 사용자 주소
 *         example: "경기"
 */

//middleware
router.get("/api/user/auth", auth, (req, res) => {
  //middleware를 통해 얻은 유저 정보를 반환한다.
  //인증 완료
  let user: UserInforDTO | null = req.user;
  //후에 디벨롭
  //role:0 -> 일반인
  //role:1,2.... -> 관리자
  if (user) {
    // 사용자 사진 가져오기
    dbSelectPictureFile(
      user.profilePicture,
      function (success, result, error, msg) {
        if (!success && error) {
          return res.status(400).json({ success: false, message: error });
        }
        // 파일이 없는 경우
        else if (!success && !error) {
          return res.status(404).json({ success: false, message: msg });
        }
        // 파일에서 이미지 데이터 가져오기 성공
        else if (result && user) {
          let userImage: string = result;

          res.status(200).json({
            success: true,
            email: user.email,
            joinDate: user.joinDate,
            nickName: user.nickName,
            profilePicture: userImage,
            location: user.location,
          });
        }
      }
    );
  } else {
    //유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "USER AUTH FAILED",
    });
  }
});

router.patch(
  "/api/user/update",
  auth,
  (req: UserRequest<UpdateUserModel>, res) => {
    //middleware를 통해 얻은 유저 정보를 이용해
    //해당 유저 정보를 수정한다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      console.log("PATCH");
      console.log("🚀 ~ req.body", req.body);
      let userID: number = user.userID;
      //object
      const param: UpdateUserReqDTO = req.body;
      if (checkEmptyValue(param)) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      updateUser(userID, param, res);
    } else {
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

router.post(
  "/api/user/updatepw",
  auth,
  (req: UserRequest<UpdatePwModel>, res) => {
    //비밀번호 변경 (로그인 된 상태)
    //현재 비밀번호 + auth + 새 비밀번호
    let user: UserInforDTO | null = req.user;

    if (user) {
      const originPw: string = req.body.originPw;
      const newPw: string = req.body.newPw;
      console.log("🚀 ~ pw", originPw, newPw);
      if (checkEmptyValue(originPw) || checkEmptyValue(newPw)) {
        return res.status(400).json({
          success: false,
          message: "PARAMETER IS EMPTY",
        });
      }
      updateUserPw(originPw, newPw, user, res);
    } else {
      return res.status(401).json({
        isAuth: false,
        message: "USER AUTH FAILED",
      });
    }
  }
);

export default router;
