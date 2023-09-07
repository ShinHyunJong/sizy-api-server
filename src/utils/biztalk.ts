import axios, { AxiosRequestConfig } from 'axios';

interface SendSMSResponse {
  header: {
    resultCode: number;
    resultMessage: string;
    isSuccessful: boolean;
  };
  body: {
    data: {
      requestId: string;
      statusCode: string;
      senderGroupingKey: 'SenderGroupingKey';
      sendResultList: {
        recipientNo: string;
        resultCode: number;
        resultMessage: string;
        recipientSeq: number;
        recipientGroupingKey: 'RecipientGroupingKey';
      }[];
    };
  };
}

type Recipient = {
  recipientNo: string;
  templateParameter: any;
};

export const sendKakao = async (
  recipientList: Recipient[],
  templateCode: string,
): Promise<SendSMSResponse> => {
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
  console.log(response.data.message.sendResults);
  return response.data;
};
