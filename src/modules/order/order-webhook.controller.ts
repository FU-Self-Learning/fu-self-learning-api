import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';
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

    try {
      logger.log('Received webhook body:', JSON.stringify(body));

      const result = await this.orderService.processWebhook(body, this.payos);

      if (!result.success) {
        logger.warn(result.message);
        return res.status(result.statusCode).json({ message: result.message });
      }

      logger.log(result.message);
      return res.status(HttpStatus.OK).json({ message: result.message });
    } catch (err) {
      logger.error('Error processing webhook', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal error',
        error: err.message,
      });
    }
  }
}
