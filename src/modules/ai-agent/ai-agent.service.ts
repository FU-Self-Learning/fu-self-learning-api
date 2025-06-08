import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { Topic } from 'src/entities/topic.entity';
import { Course } from 'src/entities/course.entity';
import { CourseService } from '../course/course.service';
import { TopicService } from '../topic/topic.service';

@Injectable()
export class AiAgentService {
  private openAIModel: ChatOpenAI;
  private chain: RunnableSequence;
  private courseService: CourseService;
  private topicService: TopicService;

  constructor() {
    this.openAIModel = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Tạo prompt mẫu
    const prompt = PromptTemplate.fromTemplate(
      `Parse the following text and generate a general summary of the document, 
         including a general title and description for the document in JSON format with the name "summary". 
         The description should be approximately 100 words (no more, no less).
         Then, generate a list of learning topics in JSON format.
         Each topic includes 2 pieces of information: title and description.
         Text: {text}`,
    );

    this.chain = RunnableSequence.from([prompt, this.openAIModel]);
  }

  async generateTopicsAndSummary(
    text: string,
    uid: string,
  ): Promise<{ topics: Topic[]; summary: Partial<Course> }> {
    try {
      const response = await this.chain.invoke({ text });

      console.log(response);

      const jsonMatch = response.content.match(/```json([\s\S]*?)```/);

      const responseJson = jsonMatch ? JSON.parse(jsonMatch[1]) : [];

      const summaryMatch = response.content.match(/"summary":\s*{([\s\S]*?)},/);
      let summary = { title: '', description: '' };

      if (summaryMatch) {
        const summaryContent = summaryMatch[1].trim();
        try {
          const parsedSummary = JSON.parse(`{${summaryContent}}`);
          summary = {
            title: parsedSummary.title || '',
            description: parsedSummary.description || '',
          };
        } catch (error) {
          Logger.error('Error parsing summary:', error);
        }
      }
      const course = await this.courseService.create(responseJson.summary, uid);
      const topics = await this.topicService.createMany(
        course.id,
        responseJson.learning_topics,
      );
      return {
        topics: topics,
        summary: course,
      };
    } catch (error) {
      Logger.error('Error in generateTopics:', error);
      throw new Error('Error processing the topics.');
    }
  }
}
