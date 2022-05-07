interface CreateUserModel extends mongoose.Document {
  email: string;
  pw: string;
  nickName: string;
  profilePicture: string;
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

export interface UserInforDTO {
  userID: number;
  email: string;
  pw: string;
  token: string | null;
  joinDate: string;
  nickName: string;
  profilePicture: string;
  location: string | null;
}

export interface CreateUserReqDTO {
  email: string;
  pw: string;
  nickName: string;
  profilePicture: string;
  location: string | null;
}

export interface UpdateUserReqDTO {
  nickName?: string;
  profilePicture?: string;
  location?: string;
}
