import axios from 'axios';
import envs from './env';

export const gitAxios = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${envs.gitToken}`,
  },
});

export const getLatestCommit = async (): Promise<{
  hash: string;
  message: string;
  desc: string;
}> => {
  const { data } = await gitAxios.get(
    `/repos/ShinHyunJong/sizy-admin/commits/main`,
  );
  // const { data: commitData } = await gitAxios.get(
  //   `/repos/ShinHyunJong/sizy-admin/commits/${data.sha}`,
  // );
  // console.log(commitData);
  const message = data.commit.message;
  const desc = data.commit.description || '기타 버그 수정';
  return {
    hash: data.sha.slice(0, 7),
    message,
    desc,
  };
};
