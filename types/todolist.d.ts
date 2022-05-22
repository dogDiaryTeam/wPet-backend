interface CreateTodolistModel extends mongoose.Document {
  petID: number;
  listDate: Date;
  content: string;
  keyword: string;
}

interface InforTodolistModel extends mongoose.Document {
  petID: number;
  todoListID: number;
}

export interface CreateTodolistReqDTO {
  petID: number;
  listDate: Date;
  content: string;
  keyword: string;
}

export interface InforTodolistReqDTO {
  petID: number;
  todoListID: number;
}
