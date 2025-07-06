import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { getPayOsConfig } from './payos.config';

interface PayOSPaymentBody {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  buyerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

@Injectable()
export class PayOsService {
  private createPaymentBody(amount: number, orderCode: number | string): PayOSPaymentBody {
    const { returnUrl, cancelUrl } = getPayOsConfig();
    
    return {
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
  }

  private createSignature(body: PayOSPaymentBody, checksumKey: string): string {
    const rawSignature = `amount=${body.amount}&cancelUrl=${body.cancelUrl}&description=${body.description}&orderCode=${body.orderCode}&returnUrl=${body.returnUrl}`;
    return crypto.createHmac('sha256', checksumKey).update(rawSignature).digest('hex');
  }

  private createPaymentHeaders(clientId: string, apiKey: string): Record<string, string> {
    return {
      'x-client-id': clientId,
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async sendPaymentRequest(
    endpoint: string,
    body: PayOSPaymentBody,
    signature: string,
    headers: Record<string, string>
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${endpoint}/v2/payment-requests`,
        { ...body, signature },
        { headers }
      );
      return response.data?.data || response.data;
    } catch (error) {
      const detail = error?.response?.data || error.message;
      console.error('PayOS ERROR >>> ', JSON.stringify(detail));
      throw new InternalServerErrorException('PayOs payment error', detail);
    }
  }

  private extractPaymentResponse(data: any): { payUrl: string; payOsOrderId: string } {
    const payUrl = data?.checkoutUrl;
    const payOsOrderId = (data?.orderCode ?? data?.order_id)?.toString() || '';
    
    console.log('PayOS RESPONSE >>> ', JSON.stringify(data));
    
    if (!payUrl) {
      throw new InternalServerErrorException('PayOs response missing checkoutUrl');
    }
    
    return { payUrl, payOsOrderId };
  }

  async createPayment(amount: number, orderCode: number | string): Promise<{ payUrl: string; payOsOrderId: string }> {
    const { clientId, apiKey, checksumKey, endpoint } = getPayOsConfig();
    
    if (!checksumKey || !clientId || !apiKey) {
      throw new InternalServerErrorException('PayOs configuration is missing required fields');
    }

    const paymentBody = this.createPaymentBody(amount, orderCode);
    const signature = this.createSignature(paymentBody, checksumKey);
    const headers = this.createPaymentHeaders(clientId, apiKey);
    
    const responseData = await this.sendPaymentRequest(endpoint, paymentBody, signature, headers);
    return this.extractPaymentResponse(responseData);
  }

  private createVerificationHeaders(clientId: string, apiKey: string): Record<string, string> {
    return {
      'x-client-id': clientId,
      'x-api-key': apiKey,
    };
  }

  private async sendVerificationRequest(endpoint: string, payOsOrderId: string, headers: Record<string, string>): Promise<any> {
    try {
      const response = await axios.get(
        `${endpoint}/v2/payment-requests/${payOsOrderId}`,
        { headers }
      );
      return response.data?.data;
    } catch (error) {
      console.error('PayOS Verification ERROR >>> ', error?.response?.data || error.message);
      return null;
    }
  }

  async verifyPayment(payOsOrderId: string): Promise<boolean> {
    const { clientId, apiKey, endpoint } = getPayOsConfig();
    
    if (!clientId || !apiKey) {
      throw new InternalServerErrorException('PayOs configuration is missing required fields');
    }

    const headers = this.createVerificationHeaders(clientId, apiKey);
    const data = await this.sendVerificationRequest(endpoint, payOsOrderId, headers);
    
    return data?.status === 'PAID';
  }
}
