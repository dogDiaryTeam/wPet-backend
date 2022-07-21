import { Response } from "express-serve-static-core";
import { dbCheckPetBeautyData } from "../../db/beauty.db/infor_beauty.db";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckPetMedicineData } from "../../db/medicine.db/infor_medicine.db";
import { dbDeletePetBeautyData } from "../../db/beauty.db/delete_beauty.db";
import { dbDeletePetMedicineData } from "../../db/medicine.db/delete_medicine.db";

export const deleteMedicineData = (
  userID: number,
  petID: number,
  medicineID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 약 데이터 삭제
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
    // 반려견의 약 데이터가 맞는지 검증
    dbCheckPetMedicineData(
      petID,
      medicineID,
      function (success, err, isPetsBeautyData, dbMedicineData) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 반려견의 약 데이터가 아닌 경우
        else if (!isPetsBeautyData) {
          return res.status(404).json({
            code: "NOT FOUND",
            errorMessage: "MEDICINE DATA NOT FOUND",
          });
        }
        // 반려견의 약 데이터가 맞는 경우
        // 삭제
        dbDeletePetMedicineData(medicineID, function (success, err) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else return res.json({ success: true });
        });
      }
    );
  });
};
