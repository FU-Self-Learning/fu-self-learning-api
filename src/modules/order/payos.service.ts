import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { getPayOsConfig } from './payos.config';

@Injectable()
export class PayOsService {
  async createPayment(amount: number, orderCode: number | string): Promise<{ payUrl: string; payOsOrderId: string }> {
    const { clientId, apiKey, checksumKey, endpoint, returnUrl, cancelUrl } = getPayOsConfig();
    const body = {
      orderCode: Number(orderCode),
      amount: Math.round(amount),
      description: `Thanh toán khoá học #${orderCode}`.slice(0, 25),
      returnUrl,
      cancelUrl,
      buyerName: 'User',
      items: [
        {
          name: `Order #${orderCode}`,
          quantity: 1,
          price: Math.round(amount),
        },
      ],
    };
    const rawSignature = `amount=${body.amount}&cancelUrl=${body.cancelUrl}&description=${body.description}&orderCode=${body.orderCode}&returnUrl=${body.returnUrl}`;
    if (!checksumKey) throw new InternalServerErrorException('PayOs checksumKey is missing');
    const checksum = crypto.createHmac('sha256', checksumKey as string).update(rawSignature).digest('hex');
    try {
      const res = await axios.post(
        `${endpoint}/v2/payment-requests`,
        { ...body, signature: checksum },
        {
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      // PayOS trả về dữ liệu nằm ở res.data hoặc res.data.data tuỳ phiên bản
      const data = res.data?.data || res.data;
      const payUrl = data?.checkoutUrl;
      const payOsOrderId = (data?.orderCode ?? data?.order_id)?.toString() || '';
      console.log('PayOS RESPONSE >>> ', JSON.stringify(data));
      if (!payUrl)
        throw new InternalServerErrorException('PayOs response missing checkoutUrl');
      return { payUrl, payOsOrderId };
    } catch (error) {
      const detail = error?.response?.data || error.message;
      console.error('PayOS ERROR >>> ', JSON.stringify(detail));
      throw new InternalServerErrorException('PayOs payment error', detail);
    }
  }

  async verifyPayment(payOsOrderId: string): Promise<boolean> {
    const { clientId, apiKey, endpoint } = getPayOsConfig();
    try {
      const res = await axios.get(`${endpoint}/v2/payment-requests/${payOsOrderId}`,
        {
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
          },
        },
      );
      return res.data?.data?.status === 'PAID';
    } catch (error) {
      return false;
    }
  }
}
