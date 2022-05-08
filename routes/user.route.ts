import {
  CreateUserModel,
  CreateUserReqDTO,
  LoginUserModel,
  SendMailModel,
  UpdateUserModel,
  UpdateUserReqDTO,
  UserInforDTO,
} from "../types/user";
import { Handler, Router } from "express";
import {
  creatUser,
  loginUser,
  logoutUser,
  sendEmail,
  test,
  updateUser,
} from "../controllers/user.controller";

import { UserRequest } from "../types/express";
import { auth } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * paths:
 *   /api/user/test:
 *     post:
 *        tags:
 *        - users
 *        description: "test"
 *        consumes:
 *          - "application/json"
 *          - "application/xml"
 *        produces:
 *          - "application/xml"
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - username
 *                properties:
 *                  artist_name:
 *                    type: string
 *                    description: 사용자 이메일 주소
 *                    example: "dd"
 *                  albums_recorded:
 *                    type: integer
 *                  username:
 *                    type: string
 *        responses:
 *          "200":
 *            description: "사용자 생성 성공"
 *            content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/definitions/User_list'
 *          "400":
 *            description: "사용자 생성 실패"
 *          "409":
 *            description: "이미 유일값을 가진 유저가 존재"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/create:
 *     post:
 *        tags:
 *        - users
 *        description: "create user"
 *        consumes:
 *          - "application/json"
 *          - "application/xml"
 *        produces:
 *          - "application/xml"
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
 *   /api/user/login:
 *     post:
 *        tags:
 *        - users
 *        description: "login user"
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
 *            description: "사용자 로그인 실패"
 *          "401":
 *            description: "비밀번호 불일치"
 *          "404":
 *            description: "이메일이 존재하지 않음"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/auth:
 *     get:
 *        tags:
 *        - users
 *        description: "auth user"
 *        produces:
 *        - applicaion/json
 *        responses:
 *          "200":
 *            description: "사용자 인증 성공"
 *          "401":
 *            description: "사용자 인증 실패"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 *   /api/user/logout:
 *     get:
 *        tags:
 *        - users
 *        description: "logout user"
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
 *   /api/user/update:
 *     patch:
 *        tags:
 *        - users
 *        description: "update user (update할 element만 요청)"
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
 *            description: "사용자 정보 수정 실패"
 *          "409":
 *            description: "수정할 이메일이 이미 존재함"
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
 *   User_list:
 *     type: object
 *     required:
 *       - success
 *       - email
 *       - token
 *     properties:
 *       success:
 *         type: boolean
 *         description: 자동차 고유번호
 *       c_type:
 *         type: string
 *         description: 자동차 등급
 *       c_name:
 *         type: string
 *         description: 자동차 모델명
 */

router.post("/api/user/test", test);

router.post("/api/user/create", (req: UserRequest<CreateUserModel>, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user: CreateUserReqDTO = req.body;
  console.log("🚀 ~ user", user);
  console.log("🚀 ~ req.body", req.body);
  creatUser(user, res);
});

router.post("/api/user/mail", (req: UserRequest<SendMailModel>, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const email: string = req.body.email;
  console.log("🚀 ~ email", email);
  sendEmail(email, res);
});

router.post("/api/user/login", (req: UserRequest<LoginUserModel>, res) => {
  //로그인 정보(email:uq, pw:uq)들을 client에서 가져오면
  //데이터베이스의 정보(email, pw)들과 비교해서
  //존재하는 유저라면 success=true
  const param: Array<string> = [req.body.email, req.body.pw];
  console.log("🚀 ~ param", param);
  loginUser(param, res);
});

//middleware
router.get("/api/user/auth", auth, (req, res) => {
  //middleware를 통해 얻은 유저 정보를 반환한다.
  //인증 완료
  let user: UserInforDTO | null = req.user;
  //후에 디벨롭
  //role:0 -> 일반인
  //role:1,2.... -> 관리자
  if (user) {
    res.status(200).json({
      success: true,
      // id: user.userID,
      // email: user.email,
      // joinDate: user.joinDate,
      // nickName: user.nickName,
      // profilePicture: user.profilePicture,
      // location: user.location,
      // isAuth: true,
    });
  } else {
    //유저 인증 no
    return res.status(401).json({
      isAuth: false,
      message: "유저 인증에 실패하였습니다.",
    });
  }
});

//logout (login된 상태이기 때문에 auth를 넣어준다.)
router.get("/api/user/logout", auth, (req, res) => {
  //middleware를 통해 얻은 유저 정보를 이용해
  //해당 유저를 로그아웃해준다. (token 제거)
  let user: UserInforDTO | null = req.user;
  if (user) {
    console.log("logout");
    logoutUser(user, res);
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
      updateUser(userID, param, res);
    }
  }
);

export default router;
