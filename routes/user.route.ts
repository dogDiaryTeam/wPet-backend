import {
  CreateUserModel,
  CreateUserReqDTO,
  LoginUserModel,
  UpdateUserModel,
  UpdateUserReqDTO,
  UserInforDTO,
} from "../types/user";
import { Handler, Router } from "express";
import {
  creatUser,
  loginUser,
  logoutUser,
  test,
  updateUser,
} from "../controllers/user.controller";

import { UserRequest } from "../types/express";
import { auth } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * paths:
 *   /user/create:
 *     post:
 *        tags:
 *        - users
 *        description: "create user"
 *        produces:
 *        - applicaion/json
 *        parameters:
 *        - name: hello
 *          in: query
 *          description: "출력문자"
 *          required: true
 *          type: string
 *        responses:
 *          "200":
 *            description: "출력 성공"
 *            content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/definitions/User_list'
 *          "404":
 *            description: "차량 리스트 불러오기 실패"
 *          "406":
 *            description: "sql injection 발생"
 *          "501":
 *            description: "파라미터값 오류"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   User_list:
 *     type: object
 *     required:
 *       - c_index
 *       - c_type
 *       - c_name
 *       - c_max_number_of_people
 *       - c_gear
 *       - c_number_of_load
 *       - c_number_of_door
 *       - c_air_conditioner_or_not
 *       - c_production_year
 *       - c_fuel
 *       - c_description
 *       - c_driver_age
 *       - a_index
 *       - a_name
 *       - a_info
 *       - a_number_of_reservation
 *       - a_grade
 *       - a_new_or_not
 *       - rs_index
 *       - car_price
 *     properties:
 *       c_index:
 *         type: integer
 *         description: 자동차 고유번호
 *       c_type:
 *         type: string
 *         description: 자동차 등급
 *       c_name:
 *         type: string
 *         description: 자동차 모델명
 *       c_max_number_of_people:
 *         type: integer
 *         description: 최대 탑승 인원수
 *       c_gear:
 *         type: string
 *         description: 기어 종류
 *       c_number_of_load:
 *         type: integer
 *         description: 짐 개수
 *       c_number_of_door:
 *         type: integer
 *         description: 문 개수
 *       c_air_conditioner_or_not:
 *         type: string
 *         enum: [y, n]
 *         description: 에어컨 유무
 *       c_production_year:
 *         type: string
 *         description: 자동차 제조년도
 *       c_fuel:
 *         type: string
 *         description: 연료 종류
 *       c_description:
 *         type: string
 *         description: 자동차 설명
 *       c_driver_age:
 *         type: integer
 *         description: 자동차 보험나이
 *       a_index:
 *         type: integer
 *         description: 업체 고유번호
 *       a_name:
 *         type: string
 *         description: 업체 이름
 *       a_info:
 *         type: string
 *         description: 업체 정보
 *       a_number_of_reservation:
 *         type: integer
 *         description: 업체 예약수
 *       a_grade:
 *         type: number
 *         format: float
 *         description: 업체 평점
 *       a_new_or_not:
 *         type: string
 *         enum: [y, n]
 *         description: 신규등록업체 유무
 *       rs_index:
 *         type: integer
 *         description: 렌트가능차량 고유번호
 *       car_price:
 *         type: integer
 *         description: 렌트가능차량 가격
 *   Error_404:
 *     type: object
 *     required:
 *       - code
 *     properties:
 *       code:
 *         type: string
 *         description: 오류 코드
 *   ApiResponse:
 *      type: "object"
 *      properties:
 *          code:
 *              type: "integer"
 *              format: "int32"
 *          type:
 *              type: "string"
 *          message:
 *              type: "string"
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
