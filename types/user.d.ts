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
  nickName: string;
}

interface UpdatePwModel extends mongoose.Document {
  originPw: string;
  newPw: string;
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

export interface CreateUserReqDTO {
  email: string;
  pw: string;
  nickName: string;
  profilePicture: string | null;
  location: string | null;
}

export interface UpdateUserReqDTO {
  nickName?: string;
  profilePicture?: string;
  location?: string;
}
