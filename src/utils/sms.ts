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
};

export const sendSMS = async (
  recipientList: Recipient[],
  title: string,
  message: string,
): Promise<SendSMSResponse> => {
  const options: AxiosRequestConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Secret-Key': 'mebSMjt7',
    },
    url: `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/MqZCZ9QcQYAEZI6E/sender/mms`,
    data: {
      title,
      sendNo: '07078076505',
      body: message,
      senderGroupingKey: 'SenderGroupingKey',
      recipientList,
    },
  };
  const response = await axios(options);

  return response.data;
};
