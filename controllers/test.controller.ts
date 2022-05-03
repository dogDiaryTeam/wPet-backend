import { Handler } from "express";
import mql from "../db/mysql";
import passw from "../db/db-password";

export const getTest: Handler = (req, res) => {
  mql.query("SELECT * FROM usertbl", (err, row) => {
    if (err) return res.json({ success: false, err });
    return res.json({ success: true, row });
  });
  // res.send(`${passw} hello world`);
};
