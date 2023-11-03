import dotenv from 'dotenv';

const env = dotenv.config();
const { parsed } = env;
const { TOSS_SECRET_KEY } = parsed;
const envs = {
  tossSecretKey: TOSS_SECRET_KEY,
};
export default envs;
