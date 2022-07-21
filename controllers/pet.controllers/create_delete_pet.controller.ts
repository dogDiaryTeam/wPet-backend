import { PetInforDTO, UpdatePetInforDTO } from "../../types/pet";
import {
  checkDate,
  checkName,
  checkPetSpecies,
  checkSex,
} from "../validations/validate";
import {
  dbCheckPetExist,
  dbCheckPetName,
  dbCheckPetSpecies,
  dbDeletePet,
  dbInsertPet,
} from "../../db/pet.db/create_delete_pet.db";
import {
  dbDeletePictureFile,
  imageController,
} from "../image.controllers/image.controller";

import { MysqlError } from "mysql";
import { Response } from "express-serve-static-core";
import { dbSelectPets } from "../../db/pet.db/infor_pet.db";

export const createPet = (
  userID: number,
  pet: PetInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 펫 등록

  // 프로필 사진 은 빈값일 수 있음
  pet.photo = pet.photo === "" ? null : pet.photo;

  // 기존에 등록한 반려견 마리 수
  dbSelectPets(userID, function (success, userPets, err) {
    if (!success) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    } else if (userPets) {
      // 한 사용자가 등록할 수 있는 최대 반려견 수 = 5
      if (userPets.length > 4)
        return res.status(400).json({
          code: "EXCEED MAX ERROR",
          errorMessage: "EXCEED MAX NUMBER OF PETS CAN BE REGISTERED (5)",
        });
      // pet 유효성 검사 (petName, birthDate, petSex, petSpecies db..)
      else if (
        !checkName(pet.name) ||
        !checkDate(pet.birthDate) ||
        !checkSex(pet.gender) ||
        !checkPetSpecies(pet.breeds)
      ) {
        let errArr: Array<string | MysqlError> = [];
        if (!checkName(pet.name)) errArr.push("NAME");
        if (!checkDate(pet.birthDate)) errArr.push("BIRTHDATE");
        if (!checkSex(pet.gender)) errArr.push("GENDER");

        if (!checkPetSpecies(pet.breeds)) errArr.push("NUMBER OF BREEDS (1-3)");
        else {
          // pet species -> db에 저장되어 있는 pet 종에 속하는지 확인
          dbCheckPetSpecies(
            pet.breeds,
            pet.breeds.length,
            function (success, err, msg) {
              if (!success && err) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              } else if (!success && !err && msg) {
                errArr.push(msg);
                return res.status(400).json({
                  code: "INVALID FORMAT ERROR",
                  errorMessage: `INVALID FORMAT : [${errArr}]`,
                });
              } else {
                return res.status(400).json({
                  code: "INVALID FORMAT ERROR",
                  errorMessage: `INVALID FORMAT : [${errArr}]`,
                });
              }
            }
          );
        }
      } else {
        // pet species -> db에 저장되어 있는 pet 종에 속하는지 확인
        dbCheckPetSpecies(
          pet.breeds,
          pet.breeds.length,
          function (success, err, msg) {
            if (!success && err) {
              return res
                .status(404)
                .json({ code: "SQL ERROR", errorMessage: err });
            }
            // pet 종이 db에 존재하지 않는 경우
            else if (!success && !err) {
              return res
                .status(400)
                .json({ code: "INVALID FORMAT ERROR", errorMessage: msg });
            }
            // pet 종이 db에 존재하는 경우
            // userID, petname -> 그 user의 petName 중복 안되는지 확인
            dbCheckPetName(userID, pet.name, function (success, err, msg) {
              if (!success && err) {
                return res
                  .status(404)
                  .json({ code: "SQL ERROR", errorMessage: err });
              }
              // petName 이 중복되는 경우
              else if (!success && !err) {
                return res
                  .status(409)
                  .json({ code: "CONFLICT ERROR", errorMessage: msg });
              }
              // petName 중복 안되는 경우
              // pet insert
              // DB에 추가 (인증 전)
              // 이미지 파일 컨트롤러
              imageController(
                pet.photo,
                function (success, imageFileUrl, error) {
                  if (!success) {
                    return res.status(404).json({
                      code: "WRITE IMAGE FILE ERROR",
                      errorMessage: error,
                    });
                  }
                  // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장
                  else {
                    pet.photo = imageFileUrl;
                    dbInsertPet(userID, pet, function (success, err) {
                      if (!success) {
                        return res
                          .status(404)
                          .json({ code: "SQL ERROR", errorMessage: err });
                      }
                      // insert 성공
                      else return res.status(201).json({ success: true });
                    });
                  }
                }
              );
            });
          }
        );
      }
    }
  });
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
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    // 사용자에게 해당 이름의 pet이 존재하지 않는 경우
    else if (!success && !err) {
      return res.status(404).json({ code: "NOT FOUND", errorMessage: msg });
    }
    // pet이 존재하는 경우
    // 그 pet 삭제
    else if (result) {
      dbDeletePet(userID, result, function (success, err) {
        // pet 삭제 실패
        if (!success) {
          return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
        }
        // pet 삭제 성공
        // 사진 데이터 존재
        else if (result.photo) {
          // pet 사진url -> 사진 파일 삭제
          dbDeletePictureFile(result.photo, function (success, error) {
            if (!success) {
              return res.status(404).json({
                code: "DELETE IMAGE FILE ERROR",
                errorMessage: error,
              });
            }
            // 파일 삭제 성공
            else return res.json({ success: true });
          });
        }
        // 사진 데이터 없음
        else return res.json({ success: true });
      });
    }
  });
};
