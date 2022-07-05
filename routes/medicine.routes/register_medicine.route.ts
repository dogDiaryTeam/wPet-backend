import { BeautyRequest, MedicineRequest } from "../../types/express";
import { CreateBeautyDTO, CreateBeautyModel } from "../../types/beauty";
import { CreateMedicineDTO, CreateMedicineModel } from "../../types/medicine";

import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { registerBeautyData } from "../../controllers/beauty.controllers/register_beauty.controller";
import { registerMedicineData } from "../../controllers/medicine.controllers/register_medicine.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /medicines:
 *     post:
 *        tags:
 *        - medicines
 *        description: "약 데이터 생성하기 (반려견 한마리 당 여러개)"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/Medicine_create_req"
 *        responses:
 *          "201":
 *            description: "약 데이터 생성 성공"
 *          "400":
 *            description: "INVALID FORMAT ERROR : 요청 값 형식이 유효하지 않음"
 *          "401":
 *            description: "AUTH FAILED: 사용자 인증 실패"
 *          "404":
 *            description: "SQL ERROR : DB 에러 / NOT FOUND : 사용자의 반려견이 아님 (반환되는 경우 없어야함)"
 *          "409":
 *            description: "CONFLICT ERROR : 반려견이 등록한 약 데이터들 중 약 명이 중복됨."
 *        security:
 *          - petstore_auth:
 *              - "write:pets"
 *              - "read:pets"
 * definitions:
 *   Medicine_create_req:
 *     type: object
 *     required:
 *       - petID
 *       - medicine
 *       - isAlarm
 *     properties:
 *       petID:
 *         type: number
 *         description: 약 데이터 등록할 반려견의 ID
 *         example: "1"
 *       medicine:
 *         type: string
 *         description: 약 이름
 *         example: "medicine1"
 *       memo:
 *         type: string
 *         description: 약 설명 (null이라면 ""로 전송)
 *         example: "aaaa"
 *       isAlarm:
 *         type: number
 *         description: 약 데이터를 투두리스트에 연동할 지 유무 (true=1, false=0)
 *         example: "1"
 *       lastDate:
 *         type: date
 *         description: 마지막 약 복용 날짜 (isAlarm=0 -> "로 전송")
 *         example: "2022-01-01"
 *       cycleDay:
 *         type: number
 *         description: 약 복용 주기 (일 단위) (isAlarm=0 -> "로 전송")
 *         example: "3"
 */

router.post(
  "/medicines",
  auth,
  (req: MedicineRequest<CreateMedicineModel>, res) => {
    // 반려견 약과 관련된 정보를 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어주고
    // 알람이 True라면
    // 투두리스트 예정일에 추가한다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const medicine: CreateMedicineDTO = req.body;

      if (
        checkEmptyValue(medicine.petID) ||
        checkEmptyValue(medicine.medicine) ||
        checkEmptyValue(medicine.isAlarm)
      ) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      } else if (
        (medicine.isAlarm === 1 && checkEmptyValue(medicine.lastDate)) ||
        checkEmptyValue(medicine.cycleDay)
      ) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }
      registerMedicineData(user.userID, medicine, res);
    } else {
      // 유저 인증 no
      return res.status(401).json({
        code: "AUTH FAILED",
        errorMessage: "USER AUTH FAILED (COOKIE ERROR)",
      });
    }
  }
);

export default router;
