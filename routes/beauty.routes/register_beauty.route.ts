import { CreateBeautyDTO, CreateBeautyModel } from "../../types/beauty";

import { BeautyRequest } from "../../types/express";
import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { registerBeautyData } from "../../controllers/beauty.controllers/register_beauty.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /beauties:
 *     post:
 *        tags:
 *        - beauties
 *        description: "미용 데이터 생성하기 (반려견 한마리 당)"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/Beauty_create_req"
 *        responses:
 *          "201":
 *            description: "미용 데이터 생성 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 (반환되는 경우 없어야함)"
 *          "409":
 *            description: "CONFLICT ERROR : 반려견이 이미 미용 데이터를 등록한 경우."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   Beauty_create_req:
 *     type: object
 *     required:
 *       - petID
 *       - lastDate
 *       - cycleDate
 *       - salon
 *     properties:
 *       petID:
 *         type: number
 *         description: 미용 데이터 등록할 반려견의 ID
 *         example: "1"
 *       lastDate:
 *         type: date
 *         description: 마지막 미용 날짜
 *         example: "2022-01-01"
 *       cycleDay:
 *         type: number
 *         description: 미용 주기 (일 단위)
 *         example: "3"
 *       salon:
 *         type: string
 *         description: 미용실 이름 (선택-> 없다면 "" 입력)
 *         example: "가나다"
 */

router.post("/beauties", auth, (req: BeautyRequest<CreateBeautyModel>, res) => {
  // 반려견 미용과 관련된 정보를 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어주고
  // 투두리스트 예정일에 추가한다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const beauty: CreateBeautyDTO = req.body;

    if (
      checkEmptyValue(beauty.petID) ||
      checkEmptyValue(beauty.lastDate) ||
      checkEmptyValue(beauty.cycleDay)
    ) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    registerBeautyData(user.userID, beauty, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
