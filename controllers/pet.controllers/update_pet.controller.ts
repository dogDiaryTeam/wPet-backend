import {
  checkDate,
  checkName,
  checkPetSpecies,
  checkPetWeight,
  checkSex,
} from "../validations/validate";
import {
  dbCheckPetName,
  dbCheckPetSpecies,
} from "../../db/pet.db/create_delete_pet.db";

import { Response } from "express-serve-static-core";
import { dbSelectPetProfilePictureUrl } from "../../db/pet.db/infor_pet.db";

// 반려견 이름 업데이트
export const updatePetName = (
  ownerID: number,
  petID: number,
  originName: string,
  patchName: string | undefined,
  res: Response<any, Record<string, any>, number>
) => {
  return new Promise((resolve, reject) => {
    if (!patchName) {
      resolve([201, ""]);
    } else if (originName === patchName) {
      resolve([204, ""]);
    }
    //수정할 petName 유효성 검사 (유효x)
    else if (!checkName(patchName)) {
      resolve([400, "INVALID FORMAT : PET'S NAME"]);
    } else {
      // 사용자의 다른 petname 중복 안되는지 확인
      dbCheckPetName(ownerID, patchName, function (success, err, msg) {
        if (!success && err) {
          resolve([404, err]);
        }
        // petName 이 중복되는 경우
        else if (!success && !err) {
          resolve([409, msg]);
        }
        // petName 중복 안되는 경우
        // petName update
        else {
          resolve([201, "name"]);
        }
      });
    }
  });
};

// 반려견 생년월일 업데이트
export const updatePetBirthDate = (
  petID: number,
  originBirthDate: Date,
  patchBirthDate: Date | undefined,
  res: Response<any, Record<string, any>, number>
) => {
  return new Promise((resolve, reject) => {
    if (!patchBirthDate) {
      resolve([201, ""]);
    } else if (originBirthDate === patchBirthDate) {
      resolve([204, ""]);
    }
    //수정할 birthDate 유효성 검사 (유효x)
    else if (!checkDate(patchBirthDate)) {
      resolve([400, "INVALID FORMAT : PET'S BIRTHDATE"]);
    } else {
      resolve([201, "birthDate"]);
    }
  });
};

// 반려견 성별 업데이트
export const updatePetSex = (
  petID: number,
  originSex: string,
  patchSex: string | undefined,
  res: Response<any, Record<string, any>, number>
) => {
  return new Promise((resolve, reject) => {
    if (!patchSex) {
      resolve([201, ""]);
    } else if (originSex === patchSex) {
      resolve([204, ""]);
    }
    //수정할 반려견 성별 유효성 검사 (유효x)
    else if (!checkSex(patchSex)) {
      resolve([400, "INVALID FORMAT : PET'S GENDER"]);
    } else {
      resolve([201, "gender"]);
    }
  });
};

// 반려견 몸무게 업데이트
export const updatePetWeight = (
  petID: number,
  originWeight: number | null,
  patchWeight: number | undefined | null,
  res: Response<any, Record<string, any>, number>
) => {
  return new Promise((resolve, reject) => {
    if (patchWeight === undefined) {
      console.log("weight == undefined");
      resolve([201, ""]);
    } else if (originWeight == patchWeight) {
      resolve([204, ""]);
    }
    //수정할 반려견 몸무게 유효성 검사 (유효x)
    else if (patchWeight && !checkPetWeight(patchWeight)) {
      resolve([400, "INVALID FORMAT : PET'S WEIGHT"]);
    } else {
      resolve([201, "weight"]);
    }
  });
};

// 반려견 사진 업데이트
export const updatePetProfilePicture = (
  petID: number,
  originProfilePicture: string | null,
  patchProfilePicture: string | undefined | null,
  res: Response<any, Record<string, any>, number>
) => {
  // profilePicture update
  return new Promise((resolve, reject) => {
    if (patchProfilePicture === undefined) {
      console.log("patchProfilePicture == undefined");
      resolve([201, ""]);
    } else if (originProfilePicture === patchProfilePicture) {
      resolve([204, ""]);
    } else {
      // 기존 반려견 사진 파일의 url 가져오기
      dbSelectPetProfilePictureUrl(petID, function (success, result, err, msg) {
        if (!success && err) {
          resolve([404, err]);
        }
        // pet 이 존재하지 않는 경우
        else if (!success && !err) {
          resolve([404, msg]);
        } else if (result !== null) {
          // result == 기존 반려견 사진 파일의 url (OR NULL)
          resolve([201, result]);
        } else {
          resolve([201, ""]);
        }
      });
    }
  });
};

// 반려견 종 업데이트
export const updatePetSpecies = (
  petID: number,
  originPetSpecies: Array<string>,
  patchPetSpecies: Array<string> | undefined,
  res: Response<any, Record<string, any>, number>
) => {
  return new Promise((resolve, reject) => {
    if (!patchPetSpecies) {
      resolve([201, ""]);
    } else if (
      JSON.stringify(originPetSpecies) == JSON.stringify(patchPetSpecies)
    ) {
      resolve([204, ""]);
    }
    //수정할 반려견 종 개수 유효성 검사 (유효x)
    else if (!checkPetSpecies(patchPetSpecies)) {
      resolve([400, "INVALID FORMAT : NUMBER OF BREEDS (1-3)"]);
    } else {
      // pet species -> db에 저장되어 있는 pet 종에 속하는지 확인
      dbCheckPetSpecies(
        patchPetSpecies,
        patchPetSpecies.length,
        function (success, err, msg) {
          if (!success && err) {
            resolve([404, err]);
          }
          // pet 종이 db에 존재하지 않는 경우
          else if (!success && !err) {
            resolve([400, msg]);
          }
          // pet 종이 db에 존재하는 경우
          // petSpecies update
          else {
            resolve([201, ""]);
          }
        }
      );
    }
  });
};
