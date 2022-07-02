import { Response } from "express-serve-static-core";
import { dbCheckPetExist } from "../../db/pet.db/create_delete_pet.db";
import { dbSelectPetBeautyData } from "../../db/beauty.db/infor_beauty.db";

export const getInfoBeautyData = (
  userID: number,
  petID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 미용 데이터 가져오기
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
      // 반려견의 미용 정보 가져오기
      // 없다면 ([])
      dbSelectPetBeautyData(
        "petID",
        petID,
        function (success, err, isBeautyData, dbBeautyData) {
          if (!success) {
            return res
              .status(404)
              .json({ code: "SQL ERROR", errorMessage: err });
          } else if (isBeautyData) {
            // beauty data 존재
            return res.json({
              result: dbBeautyData,
            });
          } else {
            // beauty data 없음
            return res.json({ result: [] });
          }
        }
      );
    }
  });
};
