interface CreateTodolistModel extends mongoose.Document {
  petID: number;
  date: Date;
  content: string;
  keyword: string;
}

interface UpdateTodolistModel extends mongoose.Document {
  date: Date;
  content: string;
  keyword: string;
}

interface InforTodolistModel extends mongoose.Document {
  petID: number;
  todoListID: number;
}

export interface CreateTodolistReqDTO {
  petID: number;
  date: Date;
  content: string;
  keyword: string;
}

export interface UpdateTodolistReqDTO {
  date: Date;
  content: string;
  keyword: string;
}

export interface InforTodolistReqDTO {
  petID: number;
  todoListID: number;
}

export interface InforPetTodolistDTO {
  todoListID: number;
  petID: number;
  date: Date;
  content: string;
  isCheck: number;
  keyword: string;
}

export interface InforUserPetsTodolistDTO {
  petID: number;
  name: string;
  todays: Array<InforPetTodolistDTO>;
  tomorrows: Array<InforPetTodolistDTO>;
}
