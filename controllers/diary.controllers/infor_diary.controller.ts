import {
  dbCheckPetIDs,
  dbCheckPetsDiary,
} from "../../db/diary.db/create_delete_diary.db";
import {
  dbSelectDiary,
  dbSelectPetAllDiarys,
} from "../../db/diary.db/infor_diary.db";
import {
  dbSelectPictureFile,
  dbSelectPictureFiles,
} from "../image.controllers/image.controller";

import { Response } from "express-serve-static-core";

export const getDiarys = (
  userID: number,
  petID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 반려견의 모든 다이어리 보여주기
  // (diaryID, title, date, picture, color, font..)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetIDs(userID, [petID], function (success, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // petID 모두 사용자의 반려견이 맞는 경우
    // 반려견의 모든 다이어리 가져오기
    dbSelectPetAllDiarys(petID, function (success, result, err) {
      if (!success) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
      }
      // 정상 출력
      else if (result) {
        // result = array..
        let diaryPictures: Array<string | null> = [];
        for (let i = 0; i < result.length; i++) {
          diaryPictures.push(result[i].photo);
        }
        // 다이어리 사진url -> 파일안의 데이터 가져오기
        dbSelectPictureFiles(diaryPictures, function (diaryPictureDatas) {
          // 파일에서 이미지 데이터 가져오기 성공 (array)
          if (result.length !== diaryPictureDatas.length)
            return res.status(404).json({
              code: "FIND IMAGE FILE ERROR",
              errorMessage: "IMAGE FILES NOT FOUND",
            });
          for (let i = 0; i < result.length; i++) {
            result[i].photo = diaryPictureDatas[i];
          }
          return res.json({ result });
        });
      }
    });
  });
};

export const getOneDiary = (
  userID: number,
  petID: number,
  diaryID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // (diaryID, petID) -> 다이어리 보여주기
  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetIDs(userID, [petID], function (success, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // petID 모두 사용자의 반려견이 맞는 경우

    // 반려견의 다이어리가 맞는지 검증

    dbCheckPetsDiary(petID, diaryID, function (success, err, msg) {
      if (!success && err) {
        return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
      }
      // 반려견의 다이어리가 아닌 경우
      else if (!success && !err) {
        return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
      }
      // 반려견의 다이어리가 맞는 경우
      // 그 다이어리 정보 return
      dbSelectDiary(petID, diaryID, function (success, result, err, msg) {
        if (!success && err) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 다이어리가 존재하지 않는 경우
        else if (!success && !err) {
          return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
        }
        // 다이어리가 존재하는 경우
        else if (result) {
          // pet 사진url -> 파일안의 데이터 가져오기
          dbSelectPictureFile(
            result.photo,
            function (success, petProfilePictureData, error, msg) {
              if (!success && error) {
                return res
                  .status(404)
                  .json({ code: "FIND IMAGE FILE ERROR", errorMessage: error });
              }
              // 파일이 없는 경우
              else if (!success && !error) {
                return res
                  .status(404)
                  .json({ code: "NOT FOUND", errorMessage: msg });
              }
              // 파일에서 이미지 데이터 가져오기 성공
              result.photo = petProfilePictureData;
              return res.json({ result });
            }
          );
        }
      });
    });
  });
};
