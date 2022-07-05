import {
  checkDate,
  checkLastDateIsLessToday,
  checkStringLen,
} from "../validations/validate";

import { CreateBeautyDTO } from "../../types/beauty";
import { CreateHospitalRecordDTO } from "../../types/hospital";
import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbInsertBeautyDueDateTodolist } from "../../db/todolist.db/create_delete_todolist.db";
import { dbInsertPetBeautyData } from "../../db/beauty.db/register_beauty.db";
import { dbInsertPetHospitalRecordData } from "../../db/hospital.db/register_hospital_record.db";
import { dbSelectPetBeautyData } from "../../db/beauty.db/infor_beauty.db";

export const registerHospitalRecordData = (
  userID: number,
  hospitalRecord: CreateHospitalRecordDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 병원 기록 데이터 등록

  // 병원비, memo 는 빈값일 수 있음
  hospitalRecord.cost = hospitalRecord.cost === 0 ? null : hospitalRecord.cost;
  hospitalRecord.memo = hospitalRecord.memo === "" ? null : hospitalRecord.memo;

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(
    userID,
    hospitalRecord.petID,
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
        // 요청 데이터 유효성 검증 (마지막 미용일)
        if (
          !checkDate(hospitalRecord.visitDate) ||
          !checkLastDateIsLessToday(hospitalRecord.visitDate) ||
          !checkStringLen(hospitalRecord.hospitalName, 20) ||
          (hospitalRecord.memo && !checkStringLen(hospitalRecord.memo, 255))
        ) {
          let errArr: Array<string> = [];
          if (!checkDate(hospitalRecord.visitDate)) errArr.push("DATE FORMAT");
          if (!checkLastDateIsLessToday(hospitalRecord.visitDate))
            errArr.push("VISIT DATE IS BIGGER THAN TODAY");
          if (!checkStringLen(hospitalRecord.hospitalName, 20))
            errArr.push("HOSPITAL NAME'S LEN");
          if (hospitalRecord.memo && !checkStringLen(hospitalRecord.memo, 255))
            errArr.push("MEMO'S LEN");
          return res.status(400).json({
            code: "INVALID FORMAT ERROR",
            errorMessage: `INVALID FORMAT : [${errArr}]`,
          });
        } else {
          // hospital table DB에 저장
          dbInsertPetHospitalRecordData(
            hospitalRecord,
            function (success, err) {
              if (!success) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              }
              res.status(201).json({ success: true });
            }
          );
        }
      }
    }
  );
};
