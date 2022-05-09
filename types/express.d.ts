import { Request } from "express";
// export interface IGetUserAuthInfoRequest extends Request {
//   user: {
//     userID: number;
//     email: string;
//     pw: string;
//     token: string | null;
//     joinDate: string;
//     nickName: string;
//     profilePicture: string;
//     location: string | null;
//   } | null;
//   token: any;
// }

// declare namespace Express {
//   export interface Request {
//     user: {
//       userID: number;
//       email: string;
//       pw: string;
//       token: string | null;
//       joinDate: string;
//       nickName: string;
//       profilePicture: string;
//       location: string | null;
//     } | null;
//     token: any;
//   }
// }
declare global {
  namespace Express {
    interface Request {
      user: {
        userID: number;
        email: string;
        pw: string;
        token: string | null;
        joinDate: string;
        nickName: string;
        profilePicture: string;
        location: string | null;
        isAuth: number;
      } | null;
      token: any;
    }
  }
}

interface UserRequest<T> extends Request {
  body: T;
}

interface PetRequest<T> extends Request {
  body: T;
}
