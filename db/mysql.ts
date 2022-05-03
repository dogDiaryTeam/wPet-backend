import * as mysql from "mysql";

import passw from "./db-password";

console.log(passw);

const mql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: passw,
  database: "wpet_db",
});

export default mql;
