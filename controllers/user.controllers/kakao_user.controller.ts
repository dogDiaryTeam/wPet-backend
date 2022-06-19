import { Response } from "express-serve-static-core";
import fetch from "node-fetch";

export const kakaoLoginApi = async (
  code: any,
  res: Response<any, Record<string, any>, number>
) => {
  const baseUrl = process.env.KAKAO_OAUTH_TOKEN_API_URL;
  const config: any = {
    client_id: process.env.KAKAO_CLIENT_ID,
    grant_type: process.env.KAKAO_GRANT_TYPE,
    redirect_uri: process.env.KAKAO_REDIRECT_URL,
    code: code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const kakaoToken = await kakao(finalUrl);

  if ("access_token" in kakaoToken) {
    // res.send("HI " + JSON.stringify(kakaoToken));
    // 엑세스 토큰이 있는 경우 API에 접근
    const { access_token } = kakaoToken;
    const userInfo = await getUserInfo(access_token);
    const kakaoID: number = userInfo.id;
    const userNickName: string = userInfo.kakao_account.profile.nickname;
    const userProfileUrl: string =
      userInfo.kakao_account.profile.profile_image_url;
    const userEmail: string = userInfo.kakao_account.email;

    // res.send("HI " + JSON.stringify(userInfo));
    return {
      kakaoID,
      userNickName,
      userProfileUrl,
      userEmail,
    };
  } else {
    // 엑세스 토큰이 없으면 로그인페이지로 리다이렉트
    console.log("access_token 없음");
    return null;
  }
};

export const kakao = async (finalUrl: any) => {
  try {
    return await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json", // 이 부분을 명시하지않으면 text로 응답을 받게됨
      },
    }).then((res) => res.json());
  } catch (e) {
    console.log(e);
  }
};

export const getUserInfo = async (access_token: any) => {
  try {
    return await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",

      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-type": "application/json",
      },
    }).then((res) => res.json());
  } catch (e) {
    console.log(e);
  }
};
