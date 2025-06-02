import { Injectable } from '@nestjs/common';
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
      throw new Error('Sender or receiver not found');
    }

    const newMsg = this.chatRepo.create({
      sender_user: sender,
      receiver_user: receiver,
      message: dto.message,
    });

    const saved = await this.chatRepo.save(newMsg);

    return {
      id: saved.id,
      senderUserId: sender.id,
      receiverUserId: receiver.id,
      message: saved.message,
      createdAt: saved.created_at,
    };
  }

  async loadMessages(senderUserId: number, receiverUserId: number) {
    const messages = await this.chatRepo.find({
      where: [
        {
          sender_user: { id: senderUserId },
          receiver_user: { id: receiverUserId },
        },
        {
          sender_user: { id: receiverUserId },
          receiver_user: { id: senderUserId },
        },
      ],
      relations: ['sender_user', 'receiver_user'],
      order: { created_at: 'ASC' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_user?.id ?? null,
      receiverId: msg.receiver_user?.id ?? null,
      message: msg.message,
      createdAt: msg.created_at,
    }));
  }
}
