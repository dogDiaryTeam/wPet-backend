import {
  authUser,
  creatUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller";

import { Router } from "express";
import { auth } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * paths:
 *   /user/createuser:
 *     get:
 *        tags:
 *        - user
 *        description: "테스트 라우트"
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

router.post("/api/user/create", creatUser);
router.post("/api/user/login", loginUser);

//middleware
router.get("/api/user/auth", auth, authUser);

//logout (login된 상태이기 때문에 auth를 넣어준다.)
router.get("/api/user/logout", auth, logoutUser);

export default router;
