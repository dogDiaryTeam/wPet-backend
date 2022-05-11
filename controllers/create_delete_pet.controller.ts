import { PetInforDTO, UpdatePetInforDTO } from "../types/pet";

import { Response } from "express-serve-static-core";

export const createPet = (
  userID: number,
  pet: PetInforDTO,
  res: Response<any, Record<string, any>, number>
) => {
  // 펫 등록
  // petName -> 유효성 검사
  // pet 유효성 검사
  // userID, petname -> 그 user의 petname 중복 안되는지 확인
  // petSpecies -> table에 있는 종인지
  // 중복 안된다면 insert
};
export const deletePet = (
  userID: number,
  petName: string,
  res: Response<any, Record<string, any>, number>
) => {
  // userID의 유저가 등록한 pet 한마리 삭제
  // petName 유효성 검증
  // userID의 유저가 등록한 pet들 중 petName의 pet 존재하는지 검증
  // 있다면
  // 그 pet 삭제
};
