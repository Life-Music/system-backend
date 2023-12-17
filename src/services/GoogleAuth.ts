import axios from 'axios';
import axiosRetry from 'axios-retry';
import EnvVars from '@src/constants/EnvVars';
axiosRetry(axios, { retries: 3 });

export default class GoogleAuth {

  public getToken(code: string) {
    const endpoint = 'https://oauth2.googleapis.com/token';

    return axios.post(endpoint, {
      code,
      client_id: EnvVars.Google.ClientId,
      client_secret: EnvVars.Google.ClientSecret,
      redirect_uri: EnvVars.Google.RedirectUri,
      grant_type: 'authorization_code',
    })
      .then((res) => res.data);
  }

  public getUserInfo(accessToken: string) {

    return axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.data);
  }
}