import { Response } from "express-serve-static-core";
import { dbCheckPetBeautyData } from "../../db/beauty.db/infor_beauty.db";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckPetHospitalRecordData } from "../../db/hospital.db/infor_hospital_record.db";
import { dbDeletePetBeautyData } from "../../db/beauty.db/delete_beauty.db";
import { dbDeletePetHospitalRecordData } from "../../db/hospital.db/delete_hospital_record.db";

export const deleteHospitalRecordData = (
  userID: number,
  petID: number,
  hospitalRecordID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 병원 기록 데이터 삭제
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
    // 반려견의 병원 기록 데이터가 맞는지 검증
    dbCheckPetHospitalRecordData(
      petID,
      hospitalRecordID,
      function (success, err, isPetsHospitalRecordData) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 반려견의 병원 기록 데이터가 아닌 경우
        else if (!isPetsHospitalRecordData) {
          return res.status(404).json({
            code: "NOT FOUND",
            errorMessage: "HOSPITAL RECORD DATA NOT FOUND",
          });
        }
        // 반려견의 병원 기록 데이터가 맞는 경우
        // 삭제
        dbDeletePetHospitalRecordData(
          hospitalRecordID,
          function (success, err) {
            if (!success) {
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: err });
            } else return res.json({ success: true });
          }
        );
      }
    );
  });
};
