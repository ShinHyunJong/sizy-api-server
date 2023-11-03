import axios from 'axios';
import envs from './env';

export async function getTossBillingKey(customerKey: string, authKey: string) {
  const key = `${envs.tossSecretKey}:`;
  const base64 = new (Buffer as any).from(key).toString('base64');

  const { data } = await axios.post(
    'https://api.tosspayments.com/v1/billing/authorizations/issue',
    {
      authKey,
      customerKey,
    },
    {
      headers: {
        Authorization: `Basic ${base64}`,
      },
    },
  );
  return {
    billingKey: data.billingKey,
  };
}
