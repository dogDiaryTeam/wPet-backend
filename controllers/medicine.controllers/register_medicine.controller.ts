import { checkPositiveNum, checkStringLen } from "../validations/validate";

import { CreateMedicineDTO } from "../../types/medicine";
import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbInsertPetMedicineData } from "../../db/medicine.db/register_medicine.db";
import { dbSelectPetMedicineData } from "../../db/medicine.db/infor_medicine.db";

export const registerMedicineData = (
  userID: number,
  medicineData: CreateMedicineDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 약 데이터 등록

  // 약 설명 memo 는 빈값일 수 있음
  medicineData.memo = medicineData.memo === "" ? null : medicineData.memo;
  // cycleDay는 빈값일 수 있음 (애초에 null값)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(
    userID,
    medicineData.petID,
    function (success, result, err, msg) {
      if (!success && err) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
      }
      // 사용자가 등록한 pet의 petID가 아닌 경우
      else if (!success && !err) {
        return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
      }
      // 사용자의 반려견이 맞는 경우
      else {
        // 요청 데이터 유효성 검증
        if (
          !checkStringLen(medicineData.medicine, 45) ||
          (medicineData.cycleDay && !checkPositiveNum(medicineData.cycleDay)) ||
          (medicineData.memo && !checkStringLen(medicineData.memo, 255))
        ) {
          let errArr: Array<string> = [];
          if (!checkStringLen(medicineData.medicine, 45))
            errArr.push("MEDICINE'S LEN");
          if (medicineData.cycleDay && !checkPositiveNum(medicineData.cycleDay))
            errArr.push("CYCLEDAY IS NEGATIVE NUMBER");
          if (medicineData.memo && !checkStringLen(medicineData.memo, 255))
            errArr.push("MEMO'S LEN");

          return res.status(400).json({
            code: "INVALID FORMAT ERROR",
            errorMessage: `INVALID FORMAT : [${errArr}]`,
          });
        } else {
          // 반려견이 이미 등록한 medicine data 중, 약 명이 중복되는지 검증
          dbSelectPetMedicineData(
            "petID",
            medicineData.petID,
            function (success, err, isMedicineData, dbMedicineData) {
              if (!success) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              } else if (
                isMedicineData &&
                dbMedicineData !== undefined &&
                dbMedicineData.medicine === medicineData.medicine
              ) {
                // 약 명 중복
                return res.status(409).json({
                  code: "CONFLICT ERROR",
                  errorMessage: `DUPLICATE MEDICINE`,
                });
              } else {
                // 약 명 중복 안됨
                // medicine table DB에 저장
                dbInsertPetMedicineData(medicineData, function (success, err) {
                  if (!success) {
                    return res
                      .status(404)
                      .json({ code: "SQL ERROR", errorMessage: err });
                  } else res.status(201).json({ success: true });
                });
              }
            }
          );
        }
      }
    }
  );
};
