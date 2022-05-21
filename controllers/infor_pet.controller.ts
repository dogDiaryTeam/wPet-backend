import {
  checkDate,
  checkName,
  checkPetSpecies,
  checkPetWeight,
  checkSex,
} from "./validate";
import {
  dbCheckPetExist,
  dbCheckPetName,
  dbCheckPetSpecies,
} from "../db/create_delete_pet.db";
import {
  dbDeletePictureFile,
  dbSelectPictureFile,
  imageController,
} from "./image.controller";
import {
  dbSelectPetProfilePictureUrl,
  dbSelectPetSpecies,
  dbSelectPets,
  dbUpdatePetInfor,
  dbUpdatePetSpecies,
} from "../db/infor_pet.db";

import { Response } from "express-serve-static-core";
import { UpdatePetInforDTO } from "../types/pet";

export const getUserPets = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 사용자가 등록한 pet들 정보 (petID, petName) return
  dbSelectPets(userID, function (success, result, err) {
    if (!success) {
      return res.status(400).json({ success: false, message: err });
    }
    // 출력 성공
    return res.json({ success: true, result });
  });
};

export const getPetInfor = (
  userID: number,
  petID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet 한마리 정보 return

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
    // 그 pet의 정보 (pettbl + speciestbl) return
    else if (result) {
      // pet 사진url -> 파일안의 데이터 가져오기
      dbSelectPictureFile(
        result.petProfilePicture,
        function (success, petProfilePictureData, error, msg) {
          if (!success && error) {
            return res.status(400).json({ success: false, message: error });
          }
          // 파일이 없는 경우
          else if (!success && !error) {
            return res.status(404).json({ success: false, message: msg });
          }
          // 파일에서 이미지 데이터 가져오기 성공
          else {
            result.petProfilePicture = petProfilePictureData;
            res.json({ success: true, result });
          }
        }
      );
    }
  });
};

export const updatePetInfor = (
  userID: number,
  updateInfor: UpdatePetInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet 한마리 정보 수정 (weight 포함)

  // userID의 유저가 등록한 pet들 중 pet 존재하는지 검증
  dbCheckPetExist(
    userID,
    updateInfor.petID,
    function (success, result, err, msg) {
      if (!success && err) {
        return res.status(400).json({ success: false, message: err });
      }
      // 사용자에게 해당 이름의 pet이 존재하지 않는 경우
      else if (!success && !err) {
        return res.status(404).json({ success: false, message: msg });
      } else if (result) {
        // pet이 존재하는 경우
        // param 유효성 검증
        let patchValue: string | Date | number | Array<string> | undefined;
        let patchKeys: Array<string> = Object.keys(updateInfor.updateElement);
        let patchLength: number = patchKeys.length;
        //key가 하나 이상이라면
        if (patchLength > 1) {
          return res.status(400).json({
            success: false,
            message: "수정 항목의 최대 길이(1)를 초과하는 리스트입니다.",
          });
        }

        //petName 수정
        if ("petName" in updateInfor.updateElement) {
          patchValue = updateInfor.updateElement["petName"];
          console.log("petName 있음");
          if (patchValue)
            updatePetName(userID, updateInfor.petID, patchValue, res);
        }
        //birthDate 수정
        else if ("birthDate" in updateInfor.updateElement) {
          patchValue = updateInfor.updateElement["birthDate"];
          //birthDate 있다면
          console.log("birthDate 있음");
          //birthDate 유효
          if (patchValue)
            updatePetBirthDate(updateInfor.petID, patchValue, res);
        }
        //petSex 수정
        else if ("petSex" in updateInfor.updateElement) {
          patchValue = updateInfor.updateElement["petSex"];
          console.log("petSex 있음");
          //petSex 유효
          if (patchValue) updatePetSex(updateInfor.petID, patchValue, res);
        }
        //weight 수정
        else if ("weight" in updateInfor.updateElement) {
          patchValue = updateInfor.updateElement["weight"];
          console.log("weight 있음");
          //weight 유효
          if (patchValue) updatePetWeight(updateInfor.petID, patchValue, res);
        }
        //petProfilePicture 수정
        else if ("petProfilePicture" in updateInfor.updateElement) {
          patchValue = updateInfor.updateElement["petProfilePicture"];
          console.log("petProfilePicture 있음");
          //petProfilePicture 유효
          if (patchValue)
            updatePetProfilePicture(updateInfor.petID, patchValue, res);
        }
        //petSpecies 수정
        else if ("petSpecies" in updateInfor.updateElement) {
          patchValue = updateInfor.updateElement["petSpecies"];
          console.log("petSpecies 있음");
          //petSpecies 유효
          if (patchValue) updatePetSpecies(updateInfor.petID, patchValue, res);
        }

        //그 외 (err)
        else {
          return res.status(400).json({
            success: false,
            message: "수정이 불가능한 항목이 존재합니다.",
          });
        }
      }
    }
  );
};

// 반려견 이름 업데이트
function updatePetName(
  ownerID: number,
  petID: number,
  patchName: string,
  res: Response<any, Record<string, any>, number>
) {
  //수정할 petName 유효성 검사 (유효x)
  if (!checkName(patchName)) {
    return res.status(400).json({
      success: false,
      message: "수정할 반려견 이름의 형식이 유효하지 않습니다.",
    });
  }
  // 사용자의 다른 petname 중복 안되는지 확인
  dbCheckPetName(ownerID, patchName, function (success, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // petName 이 중복되는 경우
    else if (!success && !err) {
      return res.status(409).json({ success: false, message: msg });
    }
    // petName 중복 안되는 경우
    // petName update
    dbUpdatePetInfor(petID, "petName", patchName, function (success, err) {
      if (!success) {
        return res.status(400).json({ success: false, message: err });
      }
      //update 성공
      else {
        return res.json({ success: true });
      }
    });
  });
}

// 반려견 생년월일 업데이트
function updatePetBirthDate(
  petID: number,
  patchBirthDate: Date,
  res: Response<any, Record<string, any>, number>
) {
  //수정할 birthDate 유효성 검사 (유효x)
  if (!checkDate(patchBirthDate)) {
    return res.status(400).json({
      success: false,
      message: "수정할 반려견 생년월일의 형식이 유효하지 않습니다.",
    });
  }

  // birthDate update
  dbUpdatePetInfor(petID, "birthDate", patchBirthDate, function (success, err) {
    if (!success) {
      return res.status(400).json({ success: false, message: err });
    }
    //update 성공
    else {
      return res.json({ success: true });
    }
  });
}

// 반려견 성별 업데이트
function updatePetSex(
  petID: number,
  patchSex: string,
  res: Response<any, Record<string, any>, number>
) {
  //수정할 반려견 성별 유효성 검사 (유효x)
  if (!checkSex(patchSex)) {
    return res.status(400).json({
      success: false,
      message: "수정할 반려견 성별의 형식이 유효하지 않습니다.",
    });
  }

  // sex update
  dbUpdatePetInfor(petID, "petSex", patchSex, function (success, err) {
    if (!success) {
      return res.status(400).json({ success: false, message: err });
    }
    //update 성공
    else {
      return res.json({ success: true });
    }
  });
}

// 반려견 몸무게 업데이트
function updatePetWeight(
  petID: number,
  patchWeight: number,
  res: Response<any, Record<string, any>, number>
) {
  //수정할 반려견 몸무게 유효성 검사 (유효x)
  if (!checkPetWeight(patchWeight)) {
    return res.status(400).json({
      success: false,
      message: "수정할 반려견 몸무게의 형식이 유효하지 않습니다.",
    });
  }

  // weight update
  dbUpdatePetInfor(petID, "weight", patchWeight, function (success, err) {
    if (!success) {
      return res.status(400).json({ success: false, message: err });
    }
    //update 성공
    else {
      return res.json({ success: true });
    }
  });
}

// 반려견 사진 업데이트
function updatePetProfilePicture(
  petID: number,
  patchProfilePicture: string,
  res: Response<any, Record<string, any>, number>
) {
  // profilePicture update

  // 기존 반려견 사진 파일의 url 가져오기
  dbSelectPetProfilePictureUrl(petID, function (success, result, err, msg) {
    if (!success && err) {
      return res.status(400).json({ success: false, message: err });
    }
    // pet 이 존재하지 않는 경우
    else if (!success && !err) {
      return res.status(404).json({ success: false, message: msg });
    } else {
      // result == 기존 반려견 사진 파일의 url (OR NULL)
      // 해당 파일 삭제
      dbDeletePictureFile(result, function (success, error) {
        if (!success) {
          return res.status(400).json({ success: false, message: error });
        }
        // 파일 삭제 완료
        // 수정할 이미지 데이터 -> 새로운 파일에 삽입
        // 이미지 파일 컨트롤러
        imageController(
          patchProfilePicture,
          function (success, imageFileUrl, error) {
            if (!success) {
              return res.status(400).json({ success: false, message: error });
            }
            // 파일 생성 완료 (imageFileUrl : 이미지 파일 저장 경로) -> DB 저장
            else if (imageFileUrl) {
              patchProfilePicture = imageFileUrl;
              dbUpdatePetInfor(
                petID,
                "petProfilePicture",
                patchProfilePicture,
                function (success, err) {
                  if (!success) {
                    return res
                      .status(400)
                      .json({ success: false, message: err });
                  }
                  //update 성공
                  else {
                    return res.json({ success: true });
                  }
                }
              );
            }
          }
        );
      });
    }
  });
}

// 반려견 종 업데이트
function updatePetSpecies(
  petID: number,
  patchPetSpecies: Array<string>,
  res: Response<any, Record<string, any>, number>
) {
  //수정할 반려견 종 개수 유효성 검사 (유효x)
  if (!checkPetSpecies(patchPetSpecies)) {
    return res.status(400).json({
      success: false,
      message: "수정할 반려견 종의 개수가 유효하지 않습니다. (1-3)",
    });
  }

  // pet species -> db에 저장되어 있는 pet 종에 속하는지 확인
  dbCheckPetSpecies(
    patchPetSpecies,
    patchPetSpecies.length,
    function (success, err, msg) {
      if (!success && err) {
        return res.status(400).json({ success: false, message: err });
      }
      // pet 종이 db에 존재하지 않는 경우
      else if (!success && !err) {
        return res.status(404).json({ success: false, message: msg });
      }
      // pet 종이 db에 존재하는 경우
      //petSpecies update
      dbUpdatePetSpecies(petID, patchPetSpecies, function (success, err, msg) {
        if (!success && err) {
          return res.status(400).json({ success: false, message: err });
        } else if (!success && !err) {
          return res.status(500).json({ success: false, message: msg });
        }
        //update 성공
        else {
          return res.json({ success: true });
        }
      });
    }
  );
}

export const getAllSpecies = (
  res: Response<any, Record<string, any>, number>
) => {
  // DB에 저장된 모든 반려견 종들 가져오기
  dbSelectPetSpecies(function (success, result, err) {
    if (!success) {
      return res.status(400).json({ success: false, message: err });
    }
    // 출력 성공
    else if (result) {
      let speciesArr: Array<string> = result.map((x) => x.petSpeciesName);
      return res.json({ success: true, result: speciesArr });
    }
  });
};
