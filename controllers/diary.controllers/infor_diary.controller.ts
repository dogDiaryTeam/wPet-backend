import { DbSelectPetsDTO, DbSelectPetsIdNameDTO } from "../../types/pet";
import { checkMonth, checkYear } from "../validations/validate";
import {
  dbCheckPetIDs,
  dbCheckPetsDiary,
  dbCheckTodayPetDiary,
} from "../../db/diary.db/create_delete_diary.db";
import {
  dbSelectDiary,
  dbSelectPetAllDiarys,
  dbSelectUserAllDiarys,
} from "../../db/diary.db/infor_diary.db";
import { dbSelectPets, dbSelectPetsIdName } from "../../db/pet.db/infor_pet.db";
import {
  dbSelectPictureFile,
  dbSelectPictureFiles,
} from "../image.controllers/image.controller";

import { Response } from "express-serve-static-core";
import { TodayDiaryWritablePetDTO } from "../../types/diary";

export const getUserDiarys = (
  userID: number,
  year: number,
  month: number,
  res: Response<any, Record<string, any>, number>
) => {
  // 사용자의 모든 반려견의 모든 다이어리 보여주기 (달 별로)
  // (date, [petID, diaryID, photo]..)
  // {2022-01-01:[{},{}..]}, 2022-01-03:[]}

  // 사용자가 등록한 pet들의
  // year, month 데이터 유효성 검증
  if (!checkYear(year) || !checkMonth(month)) {
    let errArr: Array<string> = [];
    if (!checkYear(year)) errArr.push("YEAR");
    if (!checkMonth(month)) errArr.push("MONTH");

    return res.status(400).json({
      code: "INVALID FORMAT ERROR",
      errorMessage: `INVALID FORMAT : [${errArr}]`,
    });
  } else {
    let newMonth: string =
      month < 10 ? "0" + month.toString() : month.toString();
    // 사용자의 모든 다이어리들 중 year, month에 해당하는 목록들 반환
    dbSelectUserAllDiarys(
      userID,
      year,
      newMonth,
      function (success, diarys, err) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        } else if (diarys !== null && diarys.length > 0) {
          // diary 1개 이상
          let result: any = {}; // {2022-01-01:[{},{}..]}, 2022-01-03:[]}
          let diarysLen: number = diarys.length;

          let photos = diarys.map((diary) => diary.photo);
          // 다이어리 사진url -> 파일안의 데이터 가져오기
          dbSelectPictureFiles(
            photos,
            function (success, diaryPictureDatas, err) {
              if (!success) {
                return res.status(404).json({
                  code: "FIND IMAGE FILE ERROR",
                  errorMessage: err,
                });
              } else if (diaryPictureDatas !== null) {
                // 파일에서 이미지 데이터 가져오기 성공 (array)
                if (photos.length !== diaryPictureDatas.length)
                  return res.status(404).json({
                    code: "FIND IMAGE FILE ERROR",
                    errorMessage: "IMAGE FILES NOT FOUND",
                  });

                for (let i = 0; i < diarysLen; i++) {
                  if (String(diarys[i].date) in result) {
                    // date key 존재
                    result[String(diarys[i].date)].push({
                      diaryID: diarys[i].diaryID,
                      petID: diarys[i].petID,
                      photo: diaryPictureDatas[i],
                    });
                  } else {
                    result[String(diarys[i].date)] = [
                      {
                        diaryID: diarys[i].diaryID,
                        petID: diarys[i].petID,
                        photo: diaryPictureDatas[i],
                      },
                    ];
                  }
                }
                return res.json({ result });
              }
            }
          );
        } else {
          // diary 0개
          return res.json({ result: [] });
        }
      }
    );
  }
};

export const getPetDiarys = (
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
        dbSelectPictureFiles(
          diaryPictures,
          function (success, diaryPictureDatas, err) {
            if (!success) {
              return res.status(404).json({
                code: "FIND IMAGE FILE ERROR",
                errorMessage: err,
              });
            } else if (diaryPictureDatas !== null) {
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
            }
          }
        );
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
          // console.log()
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

export const getTodayDiaryWritablePets = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // (userID) ->
  // userID의 유저가 등록한 pet들 중 당일 다이어리 작성이 가능한 펫들 반환
  //    = 당일 다이어리를 아직 작성하지 않은 펫들

  // 사용자가 등록한 펫들 가져오기
  dbSelectPetsIdName(userID, function (success, pets, err) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (pets !== null && pets.length > 0) {
      let petIDs: Array<number> = pets.map((pet) => pet.petID);
      let petLen: number = pets.length;
      let result: Array<DbSelectPetsIdNameDTO> = [];
      console.log(pets);
      // 각 펫 별로, 당일 다이어리 작성했는지 확인
      dbCheckTodayPetDiary(petIDs, function (success, err, writtenPets) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 이미 당일 다이어리 작성한 반려견들 = writtenPets
        else if (writtenPets !== undefined && writtenPets.length > 0) {
          // pets 에서 제거
          for (let i = 0; i < petLen; i++) {
            // (== -1) : 이미 작성한 펫이 아닌 경우
            // (!= -1) : 이미 작성한 펫인 경우
            console.log(pets[i].name);
            if (writtenPets.indexOf(pets[i].name) === -1)
              result.push({ petID: pets[i].petID, name: pets[i].name });
          }
          return res.json({ result });
        } else {
          result = pets;
          return res.json({ result });
        }
      });
    }
    // 반려견 등록을 하지 않은 유저
    else return res.json({ result: [] });
  });
};

/*
[ {petid:1, name:zz, writable:true}, {}...]
*/
