import {
  checkDate,
  checkLastDateIsLessToday,
  checkStringLen,
} from "../validations/validate";

import { CreateBeautyDTO } from "../../types/beauty";
import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbInsertBeautyDueDateTodolist } from "../../db/todolist.db/create_delete_todolist.db";
import { dbInsertPetBeautyData } from "../../db/beauty.db/register_beauty.db";
import { dbSelectPetBeautyData } from "../../db/beauty.db/infor_beauty.db";

export const registerBeautyData = (
  userID: number,
  beautyData: CreateBeautyDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 미용 데이터 등록

  // 미용실 이름 은 빈값일 수 있음
  beautyData.salon = beautyData.salon === "" ? null : beautyData.salon;

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(
    userID,
    beautyData.petID,
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
          !checkDate(beautyData.lastDate) ||
          !checkLastDateIsLessToday(beautyData.lastDate) ||
          (beautyData.salon && !checkStringLen(beautyData.salon, 45))
        ) {
          let errArr: Array<string> = [];
          if (!checkDate(beautyData.lastDate)) errArr.push("DATE FORMAT");
          if (!checkLastDateIsLessToday(beautyData.lastDate))
            errArr.push("LAST DATE IS BIGGER THAN TODAY");
          if (beautyData.salon && !checkStringLen(beautyData.salon, 45))
            errArr.push("SALON'S LEN");
          return res.status(400).json({
            code: "INVALID FORMAT ERROR",
            errorMessage: `INVALID FORMAT : [${errArr}]`,
          });
        } else {
          // 반려견이 이미 등록한 beauty data 없는지 검증
          dbSelectPetBeautyData(
            "petID",
            beautyData.petID,
            function (success, err, isBeautyData, dbBeautyData) {
              if (!success) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              } else if (isBeautyData) {
                // 이미 beauty data 존재
                return res.status(409).json({
                  code: "CONFLICT ERROR",
                  errorMessage: `PET IS ALREADY REGISTERED BEAUTY INFO`,
                });
              } else {
                // beauty data 없음
                // beauty table DB에 저장
                dbInsertPetBeautyData(
                  beautyData,
                  function (success, err, beautyID) {
                    if (!success) {
                      return res
                        .status(404)
                        .json({ code: "SQL ERROR", errorMessage: err });
                    } else if (beautyID !== undefined) {
                      // todolist table DB에도 저장
                      dbInsertBeautyDueDateTodolist(
                        beautyData.petID,
                        beautyID,
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
                );
              }
            }
          );
        }
      }
    }
  );
};
