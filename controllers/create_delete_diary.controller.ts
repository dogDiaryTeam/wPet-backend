import {
  checkDiaryHashTags,
  checkDiaryWeather,
  checkStringLen,
} from "./validate";
import {
  dbCheckPetIDs,
  dbCheckPetsDiary,
  dbDeleteDiary,
  dbWriteDiary,
} from "../db/create_delete_diary.db";
import { dbDeletePictureFile, imageController } from "./image.controller";

import { DiaryInforDTO } from "../types/diary";
import { Response } from "express-serve-static-core";
import { dbSelectDiaryPicture } from "../db/infor_diary.db";

export const createDiary = (
  userID: number,
  diary: DiaryInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 다이어리 등록

  // 다이어리 사진 은 빈값일 수 있음
  diary.picture = diary.picture === "" ? null : diary.picture;

  let petNum: number = diary.petIDs.length;
  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  if (petNum === 0)
    return res
      .status(400)
      .json({ success: false, message: "petID가 최소 1개 이상이어야 합니다." });

  dbCheckPetIDs(userID, diary.petIDs, function (success, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    }
    // petID 모두 사용자의 반려견이 맞는 경우

    // 다이어리 정보 유효성 검사
    if (
      !checkStringLen(diary.title, 30) ||
      !checkStringLen(diary.petState, 10) ||
      !checkStringLen(diary.weather, 10) ||
      !checkDiaryWeather(diary.weather) ||
      !checkStringLen(diary.color, 30) ||
      !checkStringLen(diary.font, 30) ||
      !checkDiaryHashTags(diary.hashTags)
    ) {
      let errMsg = "";
      let diaryTitleLenErr = checkStringLen(diary.title, 30)
        ? ""
        : "다이어리 제목 길이 이상[1-30].";
      let diaryPetStateLenErr = checkStringLen(diary.petState, 10)
        ? ""
        : "다이어리 반려견 상태 길이 이상[1-10].";
      let diaryWeatherLenErr = checkStringLen(diary.weather, 10)
        ? ""
        : "다이어리 날씨 길이 이상[1-10].";
      let diaryWeatherErr = checkDiaryWeather(diary.weather)
        ? ""
        : "다이어리 날씨 이상.";
      let diaryColorLenErr = checkStringLen(diary.color, 30)
        ? ""
        : "다이어리 색상 길이 이상[1-30].";
      let diaryFontLenErr = checkStringLen(diary.font, 30)
        ? ""
        : "다이어리 폰트 길이 이상[1-30].";
      let diaryHashTagsErr = checkDiaryHashTags(diary.hashTags)
        ? ""
        : "다이어리 해시태그 길이 이상[1-30].";
      errMsg =
        errMsg +
        diaryTitleLenErr +
        diaryPetStateLenErr +
        diaryWeatherLenErr +
        diaryWeatherErr +
        diaryColorLenErr +
        diaryFontLenErr +
        diaryHashTagsErr;

      return res.status(400).json({ success: false, message: errMsg });
    } else {
      // 다이어리 작성 (petIDs의 반려견들에게 동시에)
      // 이미지 파일 컨트롤러
      imageController(diary.picture, function (success, imageFileUrl, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장

        diary.picture = imageFileUrl;
        dbWriteDiary(diary, function (success, err, msg) {
          if (!success && err) {
            return res.status(400).json({ success: false, message: err });
          }
          // 다이어리 삽입 성공, 해시태그 삽입 실패 (백업 성공 or 실패)
          else if (!success && !err) {
            return res.status(400).json({ success: false, message: msg });
          } else {
            // 다이어리, 해시태그 삽입 성공
            res.json({ success: true });
          }
        });
      });
    }
  });
};

export const deleteDiary = (
  userID: number,
  petID: number,
  diaryID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 다이어리 삭제

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
      // 반려견의 다이어리가 아님
      else if (!success && !err) {
        return res.status(404).json({ success: false, message: msg });
      } else {
        // 반려견의 다이어리가 맞음
        // 삭제전 - 사진파일 가져오기
        dbSelectDiaryPicture(
          diaryID,
          function (success, diaryPictureData, err, msg) {
            if (!success && err) {
              return res.status(400).json({ success: false, message: err });
            }
            // 다이어리 없음
            else if (!success && !err) {
              return res.status(404).json({ success: false, message: msg });
            }
            // 사진 파일 데이터 가져오기 성공
            // 다이어리 삭제
            dbDeleteDiary(diaryID, function (success, err) {
              if (!success) {
                return res.status(400).json({ success: false, message: err });
              }

              // 다이어리, 해시태그 삭제 성공
              // diary 사진url -> 사진 파일 삭제
              dbDeletePictureFile(diaryPictureData, function (success, error) {
                if (!success) {
                  return res
                    .status(400)
                    .json({ success: false, message: error });
                }
                // 파일 삭제 성공
                res.json({ success: true });
              });
            });
          }
        );
      }
    });
  });
};
