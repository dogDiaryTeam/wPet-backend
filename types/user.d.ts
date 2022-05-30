interface CreateUserModel extends mongoose.Document {
  email: string;
  pw: string;
  nickName: string;
  profilePicture: string | null;
  location: string | null;
}

interface LoginUserModel extends mongoose.Document {
  email: string;
  pw: string;
}

interface UpdateUserModel extends mongoose.Document {
  email?: string;
  nickName?: string;
  profilePicture?: string;
  location?: string;
}

interface SendAuthEmailModel extends mongoose.Document {
  email: string;
}

interface CompareAuthEmailModel extends mongoose.Document {
  email: string;
  authString: string;
}

interface FindPwModel extends mongoose.Document {
  email: string;
}

interface UpdatePwModel extends mongoose.Document {
  originPw: string;
  newPw: string;
}

interface SendAuthUpdateEmailModel extends mongoose.Document {
  newEmail: string;
}

interface CompareAuthUpdateEmailModel extends mongoose.Document {
  newEmail: string;
  authString: string;
}

export interface UserInforDTO {
  userID: number;
  email: string;
  pw: string;
  token: string | null;
  joinDate: Date;
  nickName: string;
  profilePicture: string | null;
  location: string | null;
  isAuth: number;
}

export interface DbFindUserDTO {
  userID: number;
  email: string;
  pw: string;
  joinDate: Date;
  nickName: string;
  profilePicture: string | null;
  location: string | null;
  isAuth: number;
}

export interface CreateUserReqDTO {
  email: string;
  pw: string;
  nickName: string;
  profilePicture: string | null;
  location: string | null;
}

export interface UpdateUserReqDTO {
  email?: string;
  nickName?: string;
  profilePicture?: string;
  location?: string;
}
