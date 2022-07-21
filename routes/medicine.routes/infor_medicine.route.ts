import {
  getInfoMedicineData,
  getInfoPetsAllMedicineDatas,
} from "../../controllers/medicine.controllers/infor_medicine.controller";

import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { getInfoBeautyData } from "../../controllers/beauty.controllers/infor_beauty.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /pets/{petId}/medicines:
 *     get:
 *        tags:
 *        - medicines
 *        description: "반려견의 모든 약 데이터들 가져오기 (약 ID, 약 이름)"
 *        produces:
 *          - "application/json"
 *        parameters:
 *        - name: "petId"
 *          in: "path"
 *          description: "약 데이터를 등록한 반려견의 아이디"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "약 데이터들 가져오기 성공"
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
 *   /pets/{petId}/medicines/{medicineId}:
 *     get:
 *        tags:
 *        - medicines
 *        description: "반려견의 약 데이터 하나 가져오기"
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
 *            description: "약 데이터 가져오기 성공"
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/definitions/PetMedicineInfo'
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
 *     delete:
 *        tags:
 *        - medicines
 *        description: "반려견의 약 데이터 하나 삭제하기"
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
 *          description: "삭제할 약 데이터 ID"
 *          required: true
 *          type: "number"
 *          example: "1"
 *        responses:
 *          "200":
 *            description: "약 데이터 삭제하기 성공"
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
 * definitions:
 *   PetMedicineInfo:
 *     type: object
 *     properties:
 *       medicineDiaryID:
 *         type: number
 *         description: 약 데이터의 ID
 *       petID:
 *         type: number
 *         description: 약 데이터를 등록한 반려견의 ID
 *       medicine:
 *         type: string
 *         description: 약 이름
 *       memo:
 *         type: string
 *         description: 약 설명
 *       cycleDay:
 *         type: number
 *         description: 약 복용 주기 (일 단위)
 */

router.get("/pets/:petId/medicines", auth, (req, res) => {
  // 반려견의 모든 약 데이터들을 반환한다.
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
    getInfoPetsAllMedicineDatas(user.userID, petID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

router.get("/pets/:petId/medicines/:medicineId", auth, (req, res) => {
  // medicineID에 해당하는 반려견의 약 데이터 하나를 반환한다.
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
    getInfoMedicineData(user.userID, petID, medicineID, res);
  } else {
    // 유저 인증 no
    return res.status(401).json({
      code: "AUTH FAILED",
      errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
    });
  }
});

export default router;
