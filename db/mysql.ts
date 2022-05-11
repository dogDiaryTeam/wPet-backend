import * as mysql from "mysql";

require("dotenv").config();
console.log(process.env.DB_PASS);

const mql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASS,
  database: "wpet_db",
  dateStrings: true,
});

export default mql;
