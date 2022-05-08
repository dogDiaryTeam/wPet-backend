declare namespace NodeJS {
  export interface ProcessEnv {
    NODEMAILER_USER: string;
    NODEMAILER_PASS: string;
    DB_PASS: string;
    TOKEN: string;
  }
}
