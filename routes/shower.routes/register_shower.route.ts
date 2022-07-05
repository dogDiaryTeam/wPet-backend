import { CreateShowerDTO, CreateShowerModel } from "../../types/shower";

import { Router } from "express";
import { ShowerRequest } from "../../types/express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { registerShowerData } from "../../controllers/shower.controllers/register_shower.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /showers:
 *     post:
 *        tags:
 *        - showers
 *        description: "샤워 데이터 생성하기 (반려견 한마리 당)"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/Shower_create_req"
 *        responses:
 *          "201":
 *            description: "샤워 데이터 생성 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 (반환되는 경우 없어야함)"
 *          "409":
 *            description: "CONFLICT ERROR : 반려견이 이미 샤워 데이터를 등록한 경우."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   Shower_create_req:
 *     type: object
 *     required:
 *       - petID
 *       - lastDate
 *       - cycleDay
 *     properties:
 *       petID:
 *         type: number
 *         description: 샤워 데이터 등록할 반려견의 ID
 *         example: "1"
 *       lastDate:
 *         type: date
 *         description: 마지막 샤워 날짜
 *         example: "2022-01-01"
 *       cycleDay:
 *         type: number
 *         description: 샤워 주기 (일 단위)
 *         example: "3"
 */

router.post("/showers", auth, (req: ShowerRequest<CreateShowerModel>, res) => {
  // 반려견 샤워와 관련된 정보를 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어주고
  // 투두리스트 예정일에 추가한다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const shower: CreateShowerDTO = req.body;

    if (
      checkEmptyValue(shower.petID) ||
      checkEmptyValue(shower.lastDate) ||
      checkEmptyValue(shower.cycleDay)
    ) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    registerShowerData(user.userID, shower, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
