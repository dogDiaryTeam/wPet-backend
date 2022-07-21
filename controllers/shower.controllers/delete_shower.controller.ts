import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbCheckPetShowerData } from "../../db/shower.db/infor_shower.db";
import { dbDeletePetShowerData } from "../../db/shower.db/delete_shower.db";

export const deleteShowerData = (
  userID: number,
  petID: number,
  showerID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 샤워 데이터 삭제
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
    // 반려견의 샤워 데이터가 맞는지 검증
    dbCheckPetShowerData(
      petID,
      showerID,
      function (success, err, isPetsShowerData) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 반려견의 샤워 데이터가 아닌 경우
        else if (!isPetsShowerData) {
          return res
            .status(404)
            .json({ code: "NOT FOUND", errorMessage: "SHOWER DATA NOT FOUND" });
        }
        // 반려견의 샤워 데이터가 맞는 경우
        // 삭제
        dbDeletePetShowerData(showerID, function (success, err) {
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
