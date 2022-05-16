import { dbCheckPetIDs, dbCheckPetsDiary } from "../db/create_delete_diary.db";
import { dbSelectDiary, dbSelectPetAllDiarys } from "../db/infor_diary.db";
import { dbSelectPictureFile, dbSelectPictureFiles } from "./image.controller";

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
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    }
    // petID 모두 사용자의 반려견이 맞는 경우
    // 반려견의 모든 다이어리 가져오기
    dbSelectPetAllDiarys(petID, function (success, result, err) {
      if (!success) {
        return res.status(400).json({ success: false, message: err });
      }
      // 정상 출력
      else if (result) {
        // result = array..
        let diaryPictures: Array<string> = [];
        for (let i = 0; i < result.length; i++) {
          diaryPictures.push(result[i].picture);
        }
        // 다이어리 사진url -> 파일안의 데이터 가져오기
        dbSelectPictureFiles(diaryPictures, function (diaryPictureDatas) {
          // 파일에서 이미지 데이터 가져오기 성공 (array)
          if (result.length !== diaryPictureDatas.length)
            res
              .status(500)
              .json({ success: false, message: "이미지 처리 실패" });
          for (let i = 0; i < result.length; i++) {
            result[i].picture = diaryPictureDatas[i];
          }
          return res.json({ success: true, result });
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
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    }
    // petID 모두 사용자의 반려견이 맞는 경우

    // 반려견의 다이어리가 맞는지 검증

    dbCheckPetsDiary(petID, diaryID, function (success, err, msg) {
      if (!success && err) {
        return res.status(400).json({ success: false, message: err });
      }
      // 반려견의 다이어리가 아닌 경우
      else if (!success && !err) {
        return res.status(404).json({ success: false, message: msg });
      }
      // 반려견의 다이어리가 맞는 경우
      // 그 다이어리 정보 return
      dbSelectDiary(petID, diaryID, function (success, result, err, msg) {
        if (!success && err) {
          return res.status(400).json({ success: false, message: err });
        }
        // 다이어리가 존재하지 않는 경우
        else if (!success && !err) {
          return res.status(404).json({ success: false, message: msg });
        }
        // 다이어리가 존재하는 경우
        else if (result) {
          // pet 사진url -> 파일안의 데이터 가져오기
          dbSelectPictureFile(
            result.picture,
            function (success, petProfilePictureData, error, msg) {
              if (!success && error) {
                return res.status(400).json({ success: false, message: error });
              }
              // 파일이 없는 경우
              else if (!success && !error) {
                return res.status(404).json({ success: false, message: msg });
              }
              // 파일에서 이미지 데이터 가져오기 성공
              else if (petProfilePictureData) {
                result.picture = petProfilePictureData;
                res.json({ success: true, result });
              }
            }
          );
        }
      });
    });
  });
};
