import { ErrorCodeType } from './types';

const errorCode: ErrorCodeType = {
  duplicatedAccount: {
    code: 'AF1001',
    reason: '이미 가입된 계정입니다.',
  },
  socialRegistered: {
    code: 'AF1002',
    reason: '이미 소셜로 가입되어있습니다',
  },
  loginFailed: {
    code: 'AF2000',
    reason: '가입된 정보가 없습니다.',
  },
  userDeactivated: {
    code: 'AF2001',
    reason: '비활성화된 계정 입니다.',
  },
  alreadyFollowed: {
    code: 'SF1001',
    reason: '이미 팔로우 한 계정입니다.',
  },
  followNotExist: {
    code: 'SF1002',
    reason: '팔로우 하지 않았습니다.',
  },
  userIdRequired: {
    code: 'GF1001',
    reason: '유저 아이디가 존재하지 않습니다.',
  },
};

export default errorCode;
