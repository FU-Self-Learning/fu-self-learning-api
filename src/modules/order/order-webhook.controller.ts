import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';
import { OrderStatus } from '../../common/enums/order-status.enum';
import PayOS from '@payos/node';
import { Response } from 'express';

@Controller('orders/webhook')
export class OrderWebhookController {
  private payos: PayOS;
  constructor(
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {
    this.payos = new PayOS(
      this.configService.get<string>('PAYOS_CLIENT_ID')!,
      this.configService.get<string>('PAYOS_API_KEY')!,
      this.configService.get<string>('PAYOS_CHECKSUM_KEY')!,
    );
  }

  @Post()
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    const logger = new Logger('OrderWebhookController');
    logger.log('Received webhook body:', JSON.stringify(body));
    try {
      const webhookDataVerified = this.payos.verifyPaymentWebhookData(body);
      logger.log('Verified webhook data:', JSON.stringify(webhookDataVerified));

      if (!webhookDataVerified) {
        logger.warn('Webhook data verification failed');
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Invalid signature' });
      }

      const orderCode = webhookDataVerified.orderCode?.toString();
      const code = webhookDataVerified.code;
      logger.log('Webhook received orderCode:', orderCode);

      const orderInDb = await this.orderService.getOrderByPayOsOrderId(orderCode);
      logger.log('Order in DB:', orderInDb ? JSON.stringify(orderInDb) : 'Not found');

      if (code === '00') {
        await this.orderService.updateOrderStatusByPayOsOrderId(orderCode, OrderStatus.PAID);
        logger.log(`Order ${orderCode} marked as PAID`);
      } else {
        await this.orderService.updateOrderStatusByPayOsOrderId(orderCode, OrderStatus.FAILED);
        logger.log(`Order ${orderCode} marked as FAILED`);
      }
      return res.status(HttpStatus.OK).json({ message: 'Webhook processed' });
    } catch (err) {
      logger.error('Error processing webhook', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal error' });
    }
  }
}
