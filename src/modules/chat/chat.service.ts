import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialInteraction } from 'src/entities/social-interaction.entity';
import { Repository } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(SocialInteraction)
    private readonly chatRepo: Repository<SocialInteraction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async saveMessage(dto: SendMessageDto) {
    const sender = await this.userRepo.findOneBy({ id: dto.senderUserId });
    const receiver = await this.userRepo.findOneBy({ id: dto.receiverUserId });

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    const newMsg = this.chatRepo.create({
      senderUser: sender,
      receiverUser: receiver,
      message: dto.message,
    });

    const saved = await this.chatRepo.save(newMsg);

    return {
      id: saved.id,
      senderUserId: sender.id,
      receiverUserId: receiver.id,
      message: saved.message,
      createdAt: saved.createdAt,
    };
  }

  async loadMessages(senderUserId: number, receiverUserId: number) {
    const messages = await this.chatRepo.find({
      where: [
        {
          senderUser: { id: senderUserId },
          receiverUser: { id: receiverUserId },
        },
        {
          senderUser: { id: receiverUserId },
          receiverUser: { id: senderUserId },
        },
      ],
      relations: ['senderUser', 'receiverUser'],
      order: { createdAt: 'ASC' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderUser?.id ?? null,
      receiverId: msg.receiverUser?.id ?? null,
      message: msg.message,
      createdAt: msg.createdAt,
    }));
  }
}
