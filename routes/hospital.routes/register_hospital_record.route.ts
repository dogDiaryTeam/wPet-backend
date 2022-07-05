import {
  BeautyRequest,
  HospitalRecordRequest,
  MedicineRequest,
} from "../../types/express";
import { CreateBeautyDTO, CreateBeautyModel } from "../../types/beauty";
import {
  CreateHospitalRecordDTO,
  CreateHospitalRecordModel,
} from "../../types/hospital";
import { CreateMedicineDTO, CreateMedicineModel } from "../../types/medicine";

import { Router } from "express";
import { UserInforDTO } from "../../types/user";
import { auth } from "../../middleware/auth";
import { checkEmptyValue } from "../../controllers/validations/validate";
import { registerBeautyData } from "../../controllers/beauty.controllers/register_beauty.controller";
import { registerHospitalRecordData } from "../../controllers/hospital.controllers/register_hospital_record.controller";
import { registerMedicineData } from "../../controllers/medicine.controllers/register_medicine.controller";

const router = Router();

/**
 * @swagger
 * paths:
 *   /hospital-record:
 *     post:
 *        tags:
 *        - hospitals
 *        description: "병원 기록 데이터 생성하기 (반려견 한마리 당 여러개)"
 *        produces:
 *          - "application/json"
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/definitions/Hospital_record_create_req"
 *        responses:
 *          "201":
 *            description: "병원 기록 데이터 생성 성공"
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
 *   Hospital_record_create_req:
 *     type: object
 *     required:
 *       - petID
 *       - hospitalName
 *       - visitDate
 *     properties:
 *       petID:
 *         type: number
 *         description: 병원 기록 데이터 등록할 반려견의 ID
 *         example: "1"
 *       hospitalName:
 *         type: string
 *         description: 병원 이름
 *         example: "가나병원"
 *       visitDate:
 *         type: date
 *         description: 병원 방문 날짜
 *         example: "2022-01-01"
 *       cost:
 *         type: number
 *         description: 병원비 (null이라면 ""로 전송)
 *         example: "1"
 *       memo:
 *         type: string
 *         description: 비고 (null이라면 ""로 전송)
 *         example: "aaaa"
 */

router.post(
  "/hospital-record",
  auth,
  (req: HospitalRecordRequest<CreateHospitalRecordModel>, res) => {
    // 반려견 병원 기록을 client에서 가져오면
    // 그것들을 데이터 베이스에 저장한다.
    let user: UserInforDTO | null = req.user;

    if (user) {
      // 유저 인증 완료
      const hospitalRecord: CreateHospitalRecordDTO = req.body;

      if (
        checkEmptyValue(hospitalRecord.petID) ||
        checkEmptyValue(hospitalRecord.hospitalName) ||
        checkEmptyValue(hospitalRecord.visitDate)
      ) {
        return res.status(400).json({
          code: "INVALID FORMAT ERROR",
          errorMessage: "PARAMETER IS EMPTY",
        });
      }

      registerHospitalRecordData(user.userID, hospitalRecord, res);
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
