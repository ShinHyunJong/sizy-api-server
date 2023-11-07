import axios, { AxiosRequestConfig } from 'axios';

type Recipient = {
  recipientNo: string;
  templateParameter: any;
};

export const sendKakao = async (
  recipientList: Recipient[],
  templateCode: string,
): Promise<any> => {
  const options: AxiosRequestConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Secret-Key': 'sStzL6Wna7OMrKuP',
    },
    url: `https://api-alimtalk.cloud.toast.com/alimtalk/v2.3/appkeys/QdF67bSfEb54usgK/messages`,
    data: {
      senderKey: 'f28fdd166ba8b5a367ea512ed20943f35d8ca3c0',
      templateCode,
      recipientList,
    },
  };

  const response = await axios(options);
  return response.data;
};
