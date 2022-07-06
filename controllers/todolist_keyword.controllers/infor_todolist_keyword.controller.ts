import { Response } from "express-serve-static-core";
import { dbSelectTodolistKeywords } from "../../db/todolist_keyword.db/infor_todolist_keyword.db";

export const getTodolistKeywords = (
  res: Response<any, Record<string, any>, number>
) => {
  // 투두리스트 키워드들 가져오기

  dbSelectTodolistKeywords(function (success, err, keywords) {
    if (!success && err) {
      return res.status(404).json({ code: "SQL ERROR", errorMessage: err });
    }
    return res.json({ result: keywords });
  });
};
