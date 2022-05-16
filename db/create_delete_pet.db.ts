import { DBPetInforDTO, PetInforDTO } from "../types/pet";

import { MysqlError } from "mysql";
import mql from "./mysql";

// DB에 반려견 종이 있는지 확인
export function dbCheckPetSpecies(
  petSpecies: Array<string>,
  petSpeciesLen: number,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let reqPetSpecies: Array<string> = petSpecies;
  let sql: string = "SELECT * FROM petspeciestbl WHERE petSpeciesName=?";
  if (petSpeciesLen === 2) {
    sql += " OR petSpeciesName=?";
  } else if (petSpeciesLen === 3) {
    sql += " OR petSpeciesName=? OR petSpeciesName=?";
  }

  // DB에 반려견 종이 있는지 확인
  return mql.query(sql, petSpecies, (err, row) => {
    if (err) callback(false, err);
    // 종이 모두 있는 경우
    else if (row.length === petSpeciesLen) callback(true, null);
    // 종 개수가
    // 특정 종이 없는 경우
    else {
      for (let i = 0; i < row.length; i++) {
        let name: string = row[i].petSpeciesName;
        reqPetSpecies = reqPetSpecies.filter((element) => element !== name);
      }

      let errMsg: string = "[";

      //reqPetSpecies : 데이터에 존재하지 않는 종만 나열
      //errMsg : a, b.. 종은 반려견 종 데이터에 존재하지 않습니다.
      for (let i = 0; i < reqPetSpecies.length; i++) {
        errMsg += `${reqPetSpecies[i]}`;
        if (i < reqPetSpecies.length - 1) errMsg += `, `;
        else errMsg += `]`;
      }
      errMsg += `종은 반려견 종 데이터에 존재하지 않습니다.`;
      callback(false, null, errMsg);
    }
  });
}

// 사용자의 반려견들 중, petName이 중복되는지
export function dbCheckPetName(
  ownerID: number,
  petName: string,
  callback: (
    success: boolean,
    error: MysqlError | null,
    message?: string
  ) => void
): any {
  let sql: string = "SELECT * FROM pettbl WHERE ownerID=? AND petName=?";
  return mql.query(sql, [ownerID, petName], (err, row) => {
    if (err) callback(false, err);
    // 이미 해당 petName이 있는 경우
    else if (row.length > 0)
      callback(
        false,
        null,
        "사용자가 키우는 반려견들 중 해당 이름을 사용하는 반려견이 이미 존재합니다."
      );
    // petName이 중복되지 않는 경우
    else {
      callback(true, null);
    }
  });
}

// 사용자 반려견 Insert
export function dbInsertPet(
  ownerID: number,
  pet: PetInforDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string =
    "INSERT INTO pettbl(`ownerID`, `petName`, `birthDate`, `petProfilePicture`, `petSex`) VALUES (?,?,?,?,?)";
  return mql.query(
    sql,
    [ownerID, pet.petName, pet.birthDate, pet.petProfilePicture, pet.petSex],
    (err, row) => {
      if (err) callback(false, err);
      // insert 성공
      else {
        //pet 종 insert
        let petSpeciesLen: number = pet.petSpecies.length;
        let petID: number = row.insertId;
        let petSpeciesSql: string = `INSERT INTO pet_petspeciestbl (petSpeciesID, petID) 
                                      SELECT petSpeciesID, ${petID} FROM petspeciestbl WHERE petSpeciesName=?`;
        if (petSpeciesLen === 2) {
          petSpeciesSql += " OR petSpeciesName=?";
        } else if (petSpeciesLen === 3) {
          petSpeciesSql += " OR petSpeciesName=? OR petSpeciesName=?";
        }
        console.log(petSpeciesSql);
        mql.query(petSpeciesSql, pet.petSpecies, (err, row) => {
          if (err) callback(false, err);
          // insert 성공
          else callback(true);
        });
      }
    }
  );
}

// 사용자 반려견이 존재하는지 확인
export function dbCheckPetExist(
  ownerID: number,
  petID: number,
  callback: (
    success: boolean,
    result: DBPetInforDTO | null,
    error: MysqlError | string | null,
    message?: string
  ) => void
): any {
  let sql: string = `SELECT pettbl.petID, pettbl.petName, pettbl.birthDate, pettbl.petSex, pettbl.petProfilePicture, 
    pettbl.petLevel, pettbl.weight, GROUP_CONCAT(petspeciestbl.petSpeciesName) AS petpecies 
    FROM pettbl, pet_petspeciestbl, petspeciestbl WHERE pettbl.ownerID=? AND pettbl.petID=? 
    AND pettbl.petID=pet_petspeciestbl.petID AND pet_petspeciestbl.petSpeciesID=petspeciestbl.petSpeciesID 
    GROUP BY pettbl.petName,pettbl.birthDate, pettbl.petSex, pettbl.petProfilePicture, pettbl.petLevel, pettbl.weight`;

  return mql.query(sql, [ownerID, petID], (err, row) => {
    if (err) callback(false, null, err);
    // db error (최대 길이 = 1)
    else if (row.length > 1) callback(false, null, "db error");
    // 존재하는 경우
    else if (row.length === 1) callback(true, row[0], null);
    // 존재하지 않는 경우
    else
      callback(
        false,
        null,
        null,
        `사용자가 키우는 반려견 중 해당 반려견 이 존재하지 않습니다.`
      );
  });
}

// 사용자 반려견 삭제
export function dbDeletePet(
  ownerID: number,
  pet: DBPetInforDTO,
  callback: (success: boolean, error?: MysqlError) => void
): any {
  let sql: string =
    "DELETE FROM pettbl WHERE ownerID=? AND petID=? AND petName=? AND birthDate=? AND petSex=? AND petProfilePicture=?";
  return mql.query(
    sql,
    [
      ownerID,
      pet.petID,
      pet.petName,
      pet.birthDate,
      pet.petSex,
      pet.petProfilePicture,
    ],
    (err, row) => {
      if (err) callback(false, err);
      // 삭제 성공
      else callback(true);
    }
  );
}
