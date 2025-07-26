import { Injectable, Logger } from '@nestjs/common';
import { ChatMessageDto } from './chatbot.dto';
import { CourseService } from '../course/course.service';
import { ChatGroq } from '@langchain/groq';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RedisService } from '../redis/redis.provider';

export interface ChatHistoryMessage {
  role: 'human' | 'assistant';
  content: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  private readonly groqModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
  });

  // System prompt cho vai trò Mentor AI
  private readonly mentorSystemPrompt =
    'Bạn là một Mentor AI, chuyên hỗ trợ định hướng, tư vấn lộ trình học tập và gợi ý các khoá học phù hợp cho người dùng dựa trên thông tin website. Luôn chủ động hỏi lại để hiểu rõ nhu cầu, và chỉ gợi ý các khoá học trên website.';

  // Pipeline: check intent bằng LLM
  private async isCourseIntent(message: string): Promise<boolean> {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.mentorSystemPrompt],
      [
        'human',
        `Hãy trả lời "yes" nếu câu hỏi sau đây liên quan đến việc tìm kiếm, gợi ý, hoặc hỏi về các khoá học trên website, trả lời "no" nếu không liên quan. Chỉ trả về đúng "yes" hoặc "no".`,
      ],
      ['human', 'Câu hỏi: {message}'],
    ]);
    const chain = RunnableSequence.from([prompt, this.groqModel]);
    const response = await chain.invoke({ message });
    const content =
      typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);
    return content.trim().toLowerCase().startsWith('y');
  }

  // Lấy history từ Redis
  async getHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
    const redis = this.redisService.getRedisPub();
    const raw = await redis.get(`chat_history:${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  }

  // Lưu history vào Redis
  private async setHistory(
    sessionId: string,
    history: ChatHistoryMessage[],
  ): Promise<void> {
    const redis = this.redisService.getRedisPub();
    await redis.set(
      `chat_history:${sessionId}`,
      JSON.stringify(history),
      'EX',
      60 * 60 * 6,
    ); // 6h
  }

  constructor(
    private readonly courseService: CourseService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Xử lý message, lưu và lấy history từ Redis theo sessionId/userId
   * @param messageDto { message, sessionId, userId }
   */
  async processMessage(
    messageDto: ChatMessageDto & { sessionId: string; userId?: string },
  ): Promise<any> {
    try {
      const { sessionId, message } = messageDto;
      let history = await this.getHistory(sessionId);
      history.push({ role: 'human', content: message });
      if (history.length > 10) history = history.slice(-10);

      // Lấy danh sách courses (có thể filter theo nhu cầu)
      const courses = await this.courseService.findAll();
      const courseListText = courses
        .map(
          (c) =>
            `ID: ${c.id}, Tiêu đề: ${c.title}, Mô tả: ${c.description}, Danh mục: ${(c.categories || []).map((cat) => cat.name).join(', ')}`,
        )
        .join('\n');

      // Kiểm tra intent liên quan khoá học
      const isCourse = await this.isCourseIntent(message);
      let prompt: any;
      if (isCourse) {
        prompt = ChatPromptTemplate.fromMessages([
          ['system', this.mentorSystemPrompt],
          ...history.map((m) => [m.role, m.content] as [string, string]),
          [
            'human',
            `Danh sách khoá học trên website:\n${courseListText}\n\n${message}
        
        Yêu cầu phản hồi như sau:
        - Gợi ý danh sách các khoá học phù hợp nhất với yêu cầu người dùng.
        - Mỗi khoá học gồm: tiêu đề, mô tả ngắn gọn, và lý do đề xuất (KHÔNG chứa ID, danh mục hay thông tin kỹ thuật).
        - Ở cuối phản hồi, TRẢ VỀ MỘT DÒNG DUY NHẤT là mảng ID của các khoá học đã gợi ý (ví dụ: [1, 2, 3]).
        - Không giải thích gì thêm về mảng ID này.`,
          ],
        ]);
        const chain = RunnableSequence.from([prompt, this.groqModel]);
        const response = await chain.invoke({ message });
        const assistantContent =
          typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);
        // Parse mảng ID từ response assistant
        let suggestIds: number[] = [];
        const idMatch = assistantContent.match(/\[(.*?)\]/);
        if (idMatch) {
          try {
            suggestIds = JSON.parse(idMatch[0]);
          } catch {}
        }
        // Nếu không có mảng ID, parse các dòng ID: <number>
        if (suggestIds.length === 0) {
          const regex = /ID:\s*(\d+)/g;
          let m: any;
          while ((m = regex.exec(assistantContent)) !== null) {
            suggestIds.push(Number(m[1]));
          }
        }
        console.log(suggestIds);

        const suggestCourses = courses.filter((c) => suggestIds.includes(c.id));
        history.push({ role: 'assistant', content: assistantContent });
        await this.setHistory(sessionId, history);
        return {
          response: assistantContent,
          courses: suggestCourses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            categories: c.categories?.map((cat) => cat.name),
          })),
          timestamp: new Date().toISOString(),
        };
      }
      // Nếu không liên quan khoá học, trả lời AI thông thường
      prompt = ChatPromptTemplate.fromMessages([
        ['system', this.mentorSystemPrompt],
        ...history.map((m) => [m.role, m.content] as [string, string]),
        ['human', message],
      ]);
      const chain = RunnableSequence.from([prompt, this.groqModel]);
      const response = await chain.invoke({ message });
      const assistantContent =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);
      history.push({ role: 'assistant', content: assistantContent });
      await this.setHistory(sessionId, history);
      return {
        response: assistantContent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing message:', error.message);
      throw error;
    }
  }
}
