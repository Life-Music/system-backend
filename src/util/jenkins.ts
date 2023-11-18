import axios from 'axios';
import FormData from 'form-data';
import EnvVars from '@src/constants/EnvVars';

export default class Jenkins {
  public username: string;
  public apiKey: string;
  public token: string;

  public constructor() {
    this.username = EnvVars.Jenkins.Username;
    this.apiKey = EnvVars.Jenkins.ApiKey;
    const tokenJenkins = btoa(`${this.username}:${this.apiKey}`);
    this.token = tokenJenkins.trim();
  }

  public processAudio(id: string) {
    const formData = new FormData();
    formData.append('json', JSON.stringify({ 'parameter': [{ 'name': 'id', 'value': id }] }));

    return axios.post(EnvVars.Jenkins.ProcessAudioEndPoint, formData, {
      headers: {
        Authorization: `Basic ${this.token}`,
      },
    });
  }

}