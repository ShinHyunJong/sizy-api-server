import axios from 'axios';
import { async } from 'crypto-random-string';

const slackAxios = axios.create({
  baseURL: 'https://hooks.slack.com/services',
});

export const inquiryHookUrl =
  'T06BKDR701G/B06C8CYLRUY/rW3S71jQB5Og5yyOMkeXGzW5';

export const sendInquiryApi = async (
  brand: string,
  phone: string,
  text: string,
) => {
  await slackAxios.post(inquiryHookUrl, {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '새로운 도입 문의가 도착했습니다:',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*브랜드 지점명:*\n${brand}`,
          },
          {
            type: 'mrkdwn',
            text: `*담당자 번호:*\n${phone}`,
          },
          {
            type: 'mrkdwn',
            text: `*문의 사항:*\n${text}`,
          },
        ],
      },
    ],
  });
};
