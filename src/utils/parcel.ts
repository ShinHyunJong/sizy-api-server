import axios from 'axios';

export const parcelAxios = axios.create({
  baseURL: 'https://apis.tracker.delivery',
});
