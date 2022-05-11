import { Response } from "express-serve-static-core";
import { UpdatePetInforDTO } from "../types/pet";

export const getUserPets = (
  userID: number,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet들 정보 return
  // userID의 pet들 db에서 -> 이름 Array return
};

export const getPetInfor = (
  userID: number,
  petName: string,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet 한마리 정보 return
  // petName 유효성 검증
  // userID의 유저가 등록한 pet들 중 petName의 pet 존재하는지 검증
  // 있다면
  // 그 pet의 정보 return
  // pettbl + species return
  //
};

export const updatePetInfor = (
  userID: number,
  petName: string,
  param: UpdatePetInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet 한마리 정보 수정
  // petName 유효성 검증
  // param 유효성 검증
  // userID의 유저가 등록한 pet들 중 petName의 pet 존재하는지 검증
  // 있다면
  // 그 pet의 정보 update
  // petname -> 그 user의 다른 petname 중복 안되는지 확인
  // petProfilePicture -> 기존 사진 덮어씌우기
  // petSpecies -> table에 있는 종인지
  // pettbl + species return
  //
};
