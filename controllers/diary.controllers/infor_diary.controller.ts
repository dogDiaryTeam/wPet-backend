import {
  dbCheckPetIDs,
  dbCheckPetsDiary,
  dbCheckTodayPetDiary,
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
import { TodayDiaryWritablePetDTO } from "../../types/diary";
import { dbSelectPets } from "../../db/pet.db/infor_pet.db";

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

export const getTodayDiaryWritablePets = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // (userID) ->
  // userID의 유저가 등록한 pet들 중 당일 다이어리 작성이 가능한 펫들 반환
  //    = 당일 다이어리를 아직 작성하지 않은 펫들

  // 사용자가 등록한 펫들 가져오기
  dbSelectPets(userID, function (success, pets, err) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (pets !== null && pets.length > 0) {
      let petIDs: Array<number> = [];
      let result: Array<TodayDiaryWritablePetDTO> = [];
      let petLen: number = pets.length;
      for (let i = 0; i < petLen; i++) {
        petIDs.push(pets[i].petID);
        result.push({
          petID: pets[i].petID,
          name: pets[i].name,
          writable: true,
        });
      }

      // 각 펫 별로, 당일 다이어리 작성했는지 확인
      dbCheckTodayPetDiary(petIDs, function (success, err, writtenPets) {
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // 이미 당일 다이어리 작성한 반려견들 = writtenPets
        else if (writtenPets !== undefined && writtenPets.length > 0) {
          // pets 에서 제거
          for (let i = 0; i < petLen; i++) {
            // (== -1) : 이미 작성한 펫이 아닌 경우 = writable=true
            // (!= -1) : 이미 작성한 펫인 경우 = writable=false
            if (writtenPets.indexOf(result[i].name) !== -1)
              result[i]["writable"] = false;
          }
          return res.json({ result });
        } else {
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
