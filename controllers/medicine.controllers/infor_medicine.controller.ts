import {
  dbCheckPetMedicineData,
  dbSelectPetMedicineData,
  dbSelectPetMedicineDatas,
} from "../../db/medicine.db/infor_medicine.db";

import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbSelectPetBeautyData } from "../../db/beauty.db/infor_beauty.db";

export const getInfoPetsAllMedicineDatas = (
  userID: number,
  petID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 약 데이터들 가져오기
  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // 사용자의 반려견이 맞는 경우
    else {
      // 반려견의 약 정보들 가져오기
      // 없다면 ([])
      dbSelectPetMedicineDatas(
        petID,
        function (success, err, isMedicineData, dbMedicineDatas) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else if (isMedicineData) {
            // medicine data 존재
            return res.json({
              result: dbMedicineDatas,
            });
          } else {
            // medicine data 없음
            return res.json({ result: [] });
          }
        }
      );
    }
  });
};

export const getInfoMedicineData = (
  userID: number,
  petID: number,
  medicineID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 약 데이터 가져오기
  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // 사용자의 반려견이 맞는 경우
    else {
      // 반려견의 약 정보가 맞는지 검증
      dbCheckPetMedicineData(
        petID,
        medicineID,
        function (success, err, isPetsMedicineData, dbMedicineData) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else if (!isPetsMedicineData) {
            // 반려견의 medicine이 아닌 경우
            return res
              .status(404)
              .json({
                code: "NOT FOUND",
                errorMessage: "MEDICINE DATA NOT FOUND",
              });
          } else {
            // medicine data 있음
            return res.json({
              result: dbMedicineData,
            });
          }
        }
      );
    }
  });
};
