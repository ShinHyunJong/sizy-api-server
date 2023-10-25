import randomstring from 'randomstring';

/**
 *
 * @param length
 * @desc 숫자 난수 생성
 * @returns 난수
 */

export const generateRandomNumber = (length: number) => {
  const string = randomstring.generate({
    length,
    charset: 'numeric',
  });
  return string;
};

export const generateId = (prefixNum = 9): number => {
  const randomNumber = generateRandomNumber(8);
  const prefixed = `${prefixNum}${randomNumber}`;
  return Number(prefixed);
};
