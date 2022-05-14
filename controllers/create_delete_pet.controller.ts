import { PetInforDTO, UpdatePetInforDTO } from "../types/pet";
import { checkDate, checkName, checkPetSpecies, checkSex } from "./validate";
import {
  dbCheckPetExist,
  dbCheckPetName,
  dbCheckPetSpecies,
  dbDeletePet,
  dbInsertPet,
} from "../db/create_delete_pet.db";

import { Response } from "express-serve-static-core";

export const createPet = (
  userID: number,
  pet: PetInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 펫 등록
  // pet 유효성 검사 (petName, birthDate, petSex, petSpecies db..)

  if (
    !checkName(pet.petName) ||
    !checkDate(pet.birthDate) ||
    !checkSex(pet.petSex) ||
    !checkPetSpecies(pet.petSpecies)
  ) {
    let errMsg = "";
    let petNameErr = checkName(pet.petName) ? "" : "반려견 이름 이상.";
    let petBirthDateErr = checkDate(pet.birthDate)
      ? ""
      : "반려견 생년월일 이상.";
    let petSexErr = checkSex(pet.petSex) ? "" : "반려견 성별 이상.";
    let petSpeciesErr = checkPetSpecies(pet.petSpecies)
      ? ""
      : "반려견 종 개수 이상.";
    errMsg = errMsg + petNameErr + petBirthDateErr + petSexErr + petSpeciesErr;

    if (petSpeciesErr === "") {
      // pet species -> db에 저장되어 있는 pet 종에 속하는지 확인
      dbCheckPetSpecies(
        pet.petSpecies,
        pet.petSpecies.length,
        function (success, err, msg) {
          if (!success && err) {
            errMsg += err;
          } else if (!success && !err) {
            errMsg += `${msg}`;
          }
          console.log("errMsg:", errMsg);
          return res.status(400).json({ success: false, message: errMsg });
        }
      );
    }
  } else {
    // pet species -> db에 저장되어 있는 pet 종에 속하는지 확인
    dbCheckPetSpecies(
      pet.petSpecies,
      pet.petSpecies.length,
      function (success, err, msg) {
        if (!success && err) {
          return res.status(400).json({ success: false, message: err });
        }
        // pet 종이 db에 존재하지 않는 경우
        else if (!success && !err) {
          return res.status(400).json({ success: false, message: msg });
        }
        // pet 종이 db에 존재하는 경우
        // userID, petname -> 그 user의 petName 중복 안되는지 확인
        dbCheckPetName(userID, pet.petName, function (success, err, msg) {
          if (!success && err) {
            return res.status(400).json({ success: false, message: err });
          }
          // petName 이 중복되는 경우
          else if (!success && !err) {
            return res.status(409).json({ success: false, message: msg });
          }
          // petName 중복 안되는 경우
          // pet insert
          dbInsertPet(userID, pet, function (success, err) {
            if (!success) {
              return res.status(400).json({ success: false, message: err });
            }
            // insert 성공
            return res.json({ success: true });
          });
        });
      }
    );
  }
};
export const deletePet = (
  userID: number,
  petID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet 한마리 삭제

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(userID, petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // 사용자에게 해당 이름의 pet이 존재하지 않는 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    }
    // pet이 존재하는 경우
    // 그 pet 삭제
    else if (result) {
      console.log(result);
      dbDeletePet(userID, result, function (success, err) {
        // pet 삭제 실패
        if (!success) {
          return res.status(400).json({ success: false, message: err });
        }
        // pet 삭제 성공
        return res.json({ success: true });
      });
    }
  });
};
