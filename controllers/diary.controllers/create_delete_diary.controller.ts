import {
  checkDiaryHashTags,
  checkDiaryWeather,
  checkStringLen,
} from "../validations/validate";
import {
  dbCheckPetIDs,
  dbCheckPetsDiary,
  dbCheckTodayPetDiary,
  dbDeleteDiary,
  dbWriteDiary,
} from "../../db/diary.db/create_delete_diary.db";
import {
  dbDeletePictureFile,
  imageController,
} from "../image.controllers/image.controller";

import { DiaryInforDTO } from "../../types/diary";
import { Response } from "express-serve-static-core";
import { dbSelectDiaryPicture } from "../../db/diary.db/infor_diary.db";

export const createDiary = (
  userID: number,
  diary: DiaryInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 다이어리 등록

  // 다이어리 사진 은 빈값일 수 있음
  diary.photo = diary.photo === "" ? null : diary.photo;

  let petNum: number = diary.petIDs.length;
  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  if (petNum === 0)
    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: "MIN NUMBER OF PETIDS : 1",
    });

  dbCheckPetIDs(userID, diary.petIDs, function (success, err, msg) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자가 등록한 pet의 petID가 아닌 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
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
      let errArr: Array<string> = [];
      if (!checkStringLen(diary.title, 30)) errArr.push("TITLE'S LEN");
      if (!checkStringLen(diary.petState, 10)) errArr.push("PET STATE'S LEN");
      if (!checkStringLen(diary.weather, 10)) errArr.push("WEATHER'S LEN");
      if (!checkDiaryWeather(diary.weather)) errArr.push("WEATHER");
      if (!checkStringLen(diary.color, 30)) errArr.push("COLOR'S LEN");
      if (!checkStringLen(diary.font, 30)) errArr.push("FONT'S LEN");
      if (!checkDiaryHashTags(diary.hashTags)) errArr.push("HASHTAG'S LEN");

      return res.status(400).json({
        code: "INVALID FORMAT ERROR",
        errorMessage: `INVALID FORMAT : [${errArr}]`,
      });
    } else {
      // (반려견 당) 하루에 한 다이어리만 작성 가능
      dbCheckTodayPetDiary(diary.petIDs, function (success, err, msg) {
        if (!success && err) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 이미 당일 다이어리 작성한 반려견 존재 -> 작성 불가
        else if (!success && !err) {
          return res.status(409).json({
            code: "CONFLICT ERROR",
            errorMessage: msg,
          });
        }
        // 이미 작성한 반려견들이 없다면 -> 작성 가능
        else {
          // 다이어리 작성 (petIDs의 반려견들에게 동시에)

          // 이미지 파일 컨트롤러
          imageController(diary.photo, function (success, imageFileUrl, error) {
            if (!success) {
              return res
                .status(404)
                .json({ code: "WRITE IMAGE FILE ERROR", errorMessage: error });
            }
            // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장

            diary.photo = imageFileUrl;
            dbWriteDiary(diary, function (success, err, msg) {
              if (!success && err) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              }
              // 다이어리 삽입 성공, 해시태그 삽입 실패 (백업 성공 or 실패)
              else if (!success && !err) {
                return res
                  .status(404)
                  .json({ code: "WRITE DIARY ERROR", errorMessage: msg });
              } else {
                // 다이어리, 해시태그 삽입 성공
                res.status(201).json({ success: true });
              }
            });
          });
        }
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
      // 반려견의 다이어리가 아님
      else if (!success && !err) {
        return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
      } else {
        // 반려견의 다이어리가 맞음
        // 삭제전 - 사진파일 가져오기
        dbSelectDiaryPicture(
          diaryID,
          function (success, diaryPictureData, err, msg) {
            if (!success && err) {
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: err });
            }
            // 다이어리 없음
            else if (!success && !err) {
              return res
                .status(404)
                .json({ code: "NOT FOUND", errorMessage: msg });
            }
            // 사진 파일 데이터 가져오기 성공
            // 다이어리 삭제
            dbDeleteDiary(diaryID, function (success, err) {
              if (!success) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              }

              // 다이어리, 해시태그 삭제 성공
              // diary 사진url -> 사진 파일 삭제
              dbDeletePictureFile(diaryPictureData, function (success, error) {
                if (!success) {
                  return res.status(404).json({
                    code: "DELETE IMAGE FILE ERROR",
                    errorMessage: error,
                  });
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
