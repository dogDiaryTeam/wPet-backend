import { Router } from "express";
import { ShowerRequest } from "../../types/express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { getInfoShowerData } from "../../controllers/shower.controllers/infor_shower.controller";
import { registerShowerData } from "../../controllers/shower.controllers/register_shower.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /pets/{petId}/showers:
 *     get:
 *        tags:
 *        - showers
 *        description: "반려견의 샤워 데이터 가져오기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "샤워 데이터를 등록한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "샤워 데이터 가져오기 성공"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/PetShowerInfo'
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
 *   PetShowerInfo:
 *     type: object
 *     properties:
 *       showerDiaryID:
 *         type: number
 *         description: 샤워 데이터의 ID
 *       petID:
 *         type: number
 *         description: 샤워 데이터를 등록한 반려견의 ID
 *       lastDate:
 *         type: date
 *         description: 마지막 샤워 날짜
 *       cycleDay:
 *         type: number
 *         description: 샤워 주기 (일 단위)
 *       dueDate:
 *         type: date
 *         description: 다음 샤워 예정일
 */

router.get("/pets/:petId/showers", auth, (req, res) => {
  // 반려견 샤워와 관련된 정보를 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어주고
  // 다음 예정일을 반환, 투두리스트 예정일에 추가한다.
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
    getInfoShowerData(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
