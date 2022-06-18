interface CreateUserModel extends mongoose.Document {
  email: string;
  pw: string;
  nickName: string;
  photo: string | null;
  location: string | null;
}

interface LoginUserModel extends mongoose.Document {
  email: string;
  pw: string;
}

interface UpdateUserModel extends mongoose.Document {
  nickName?: string;
  photo?: string;
  location?: string;
}

interface SendAuthEmailModel extends mongoose.Document {
  email: string;
}

interface CompareAuthEmailModel extends mongoose.Document {
  email: string;
  authCode: string;
}

interface FindPwModel extends mongoose.Document {
  email: string;
}

interface UpdatePwModel extends mongoose.Document {
  oldPw: string;
  newPw: string;
}

interface SendAuthUpdateEmailModel extends mongoose.Document {
  newEmail: string;
}

interface CompareAuthUpdateEmailModel extends mongoose.Document {
  newEmail: string;
  authCode: string;
}

interface DeleteUserModel extends mongoose.Document {
  pw: string;
}

export interface UserInforDTO {
  userID: number;
  email: string;
  pw: string;
  token: string | null;
  joinDate: Date;
  nickName: string;
  photo: string | null;
  location: string | null;
  isAuth: number;
}

export interface DbFindUserDTO {
  userID: number;
  email: string;
  pw: string;
  joinDate: Date;
  nickName: string;
  photo: string | null;
  location: string | null;
  isAuth: number;
}

export interface CreateUserReqDTO {
  email: string;
  pw: string;
  nickName: string;
  photo: string | null;
  location: string | null;
}

export interface UpdateUserReqDTO {
  nickName?: string;
  photo?: string;
  location?: string;
}
