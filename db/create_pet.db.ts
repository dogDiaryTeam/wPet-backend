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
    // 특정 종이 없는 경우
    else {
      for (let i = 0; i < row.length; i++) {
        let name: string = row[i].petSpeciesName;
        reqPetSpecies = reqPetSpecies.filter((element) => element !== name);
      }

      let errMsg: string = "";

      //reqPetSpecies : 데이터에 존재하지 않는 종만 나열
      //errMsg : a, b.. 종은 반려견 종 데이터에 존재하지 않습니다.
      for (let i = 0; i < reqPetSpecies.length; i++) {
        errMsg += `${reqPetSpecies[i]}`;
        if (i < reqPetSpecies.length - 1) errMsg += `, `;
      }
      errMsg += ` 종은 반려견 종 데이터에 존재하지 않습니다.`;
      callback(false, null, errMsg);
    }
  });
}
