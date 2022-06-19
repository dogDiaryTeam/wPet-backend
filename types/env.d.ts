declare namespace NodeJS {
  export interface ProcessEnv {
    NODEMAILER_USER: string;
    NODEMAILER_PASS: string;
    DB_PASS: string;
    TOKEN: string;
    KAKAO_NICKNAME_TOKEN: string;
    KAKAO_OAUTH_TOKEN_API_URL: string;
    KAKAO_GRANT_TYPE: string;
    KAKAO_CLIENT_ID: string;
    KAKAO_REDIRECT_URL: string;
  }
}
