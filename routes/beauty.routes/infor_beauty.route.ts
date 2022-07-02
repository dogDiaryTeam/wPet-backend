import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { getInfoBeautyData } from "../../controllers/beauty.controllers/infor_beauty.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /pets/{petId}/beauties:
 *     get:
 *        tags:
 *        - beauties
 *        description: "반려견의 미용 데이터 가져오기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "미용 데이터를 등록한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "미용 데이터 가져오기 성공"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/PetBeautyInfo'
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   PetBeautyInfo:
 *     type: object
 *     properties:
 *       beautyDiaryID:
 *         type: number
 *         description: 미용 데이터의 ID
 *       petID:
 *         type: number
 *         description: 미용 데이터를 등록한 반려견의 ID
 *       lastDate:
 *         type: date
 *         description: 마지막 미용 날짜
 *       cycleDay:
 *         type: number
 *         description: 미용 주기 (일 단위)
 *       dueDate:
 *         type: date
 *         description: 다음 미용 예정일
 *       salon:
 *         type: string
 *         description: 미용실 이름
 */

router.get("/pets/:petId/beauties", auth, (req, res) => {
  // 반려견의 미용 데이터를 반환한다.
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = Number(req.params.petId);
    if (checkEmptyValue(petID)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    getInfoBeautyData(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
