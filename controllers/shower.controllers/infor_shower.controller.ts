import { checkDate, checkLastDateIsLessToday } from "../validations/validate";

import { CreateShowerDTO } from "../../types/shower";
import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbInsertPetShowerData } from "../../db/shower.db/register_shower.db";
import { dbSelectPetShowerData } from "../../db/shower.db/infor_shower.db";

export const getInfoShowerData = (
  userID: number,
  petID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 샤워 데이터 가져오기
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
      // 반려견의 샤워 정보 가져오기
      // 없다면 ([])
      dbSelectPetShowerData(
        "petID",
        petID,
        function (success, err, isShowerData, dbShowerData) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else if (isShowerData) {
            // shower data 존재
            return res.json({
              result: dbShowerData,
            });
          } else {
            // shower data 없음
            return res.json({ result: [] });
          }
        }
      );
    }
  });
};
