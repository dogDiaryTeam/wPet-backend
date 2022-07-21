import { CreateShowerDTO, CreateShowerModel } from "../../types/shower";

import { Router } from "express";
import { ShowerRequest } from "../../types/express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { deleteBeautyData } from "../../controllers/beauty.controllers/delete_beauty.controller";
import { deleteMedicineData } from "../../controllers/medicine.controllers/delete_medicine.controller";
import { deleteShowerData } from "../../controllers/shower.controllers/delete_shower.controller";
import { registerShowerData } from "../../controllers/shower.controllers/register_shower.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /pets/{petId}/medicines/{medicineId}:
 *     delete:
 *        tags:
 *        - medicines
 *        description: "반려견의 약 데이터 삭제하기"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "약 데이터를 등록한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        - name: "medicineId"
 *          in: "path"
 *          description: "약 데이터 ID"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "약 데이터 삭제 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아니거나 반려견의 약 데이터가 아닌 경우 (반환되는 경우 없어야함)"
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 */

router.delete("/pets/:petId/medicines/:medicineId", auth, (req, res) => {
  // 반려견의 약 데이터를 삭제
  let user: UserInforDTO | null = req.user;

  if (user) {
    // 유저 인증 완료
    const petID: number = Number(req.params.petId);
    const medicineID: number = Number(req.params.medicineId);

    if (checkEmptyValue(petID) || checkEmptyValue(medicineID)) {
      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: "PARAMETER IS EMPTY",
      });
    }
    deleteMedicineData(user.userID, petID, medicineID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
