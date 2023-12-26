import dotenv from 'dotenv';

const env = dotenv.config();
const { parsed } = env;
const { TOSS_SECRET_KEY, GIT_TOKEN } = parsed;
const envs = {
  tossSecretKey: TOSS_SECRET_KEY,
  gitToken: GIT_TOKEN,
};
export default envs;
