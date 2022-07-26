import { CreateShowerDTO } from "../../types/shower";
import { Response } from "express-serve-static-core";
import { checkPositiveNum } from "../validations/validate";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbInsertPetShowerData } from "../../db/shower.db/register_shower.db";
import { dbSelectPetShowerData } from "../../db/shower.db/infor_shower.db";

export const registerShowerData = (
  userID: number,
  showerData: CreateShowerDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 샤워 데이터 등록
  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(
    userID,
    showerData.petID,
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
        // 요청 데이터 유효성 검증 (주기 >= 0)
        if (!checkPositiveNum(showerData.cycleDay))
          return res.status(400).json({
            code: "INVALID FORMAT ERROR",
            errorMessage: `INVALID FORMAT : CYCLE DAY FORMAT`,
          });
        else {
          // 반려견이 이미 등록한 shower data 없는지 검증
          dbSelectPetShowerData(
            "petID",
            showerData.petID,
            function (success, err, isShowerData, dbShowerData) {
              if (!success) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              } else if (isShowerData) {
                // 이미 shower data 존재
                return res.status(409).json({
                  code: "CONFLICT ERROR",
                  errorMessage: `PET IS ALREADY REGISTERED SHOWER INFO`,
                });
              } else {
                // shower data 없음
                // shower table DB에 저장
                dbInsertPetShowerData(showerData, function (success, err) {
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
