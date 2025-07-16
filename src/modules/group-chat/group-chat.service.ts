import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupChat } from '../../entities/group-chat.entity';
import { GroupMember } from '../../entities/group-member.entity';
import { GroupMessage } from '../../entities/group-message.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class GroupChatService {
  constructor(
    @InjectRepository(GroupChat)
    private readonly groupChatRepo: Repository<GroupChat>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepo: Repository<GroupMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async createGroup(dto: CreateGroupDto, creatorId: number) {
    const creator = await this.userRepo.findOneBy({ id: creatorId });
    const course = await this.courseRepo.findOneBy({ id: dto.courseId });
    if (!creator || !course) throw new NotFoundException('Creator or course not found');

    const group = this.groupChatRepo.create({ name: dto.name, course, creator });
    const savedGroup = await this.groupChatRepo.save(group);

    // Add creator as member (admin)
    await this.groupMemberRepo.save({ group: savedGroup, user: creator, role: 'admin' });
    // Add other members
    if (dto.memberIds && dto.memberIds.length > 0) {
      const members = await this.userRepo.findByIds(dto.memberIds);
      for (const member of members) {
        await this.groupMemberRepo.save({ group: savedGroup, user: member, role: 'member' });
      }
    }
    return savedGroup;
  }

  async getUserGroups(userId: number) {
    const memberships = await this.groupMemberRepo.find({
      where: { user: { id: userId } },
      relations: ['group', 'group.course'],
    });
    return memberships.map(m => m.group);
  }

  async addMessage(groupId: number, senderId: number, message: string) {
    const group = await this.groupChatRepo.findOneBy({ id: groupId });
    const sender = await this.userRepo.findOneBy({ id: senderId });
    if (!group || !sender) throw new NotFoundException('Group or sender not found');
    // Check if sender is member
    const isMember = await this.groupMemberRepo.findOne({ where: { group: { id: groupId }, user: { id: senderId } } });
    if (!isMember) throw new ForbiddenException('Not a group member');
    const msg = this.groupMessageRepo.create({ group, sender, message });
    return this.groupMessageRepo.save(msg);
  }

  async getGroupMessages(groupId: number) {
    return this.groupMessageRepo.find({
      where: { group: { id: groupId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}
