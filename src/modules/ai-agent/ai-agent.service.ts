import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from 'src/entities/topic.entity';
import { Course } from 'src/entities/course.entity';
import { CourseService } from '../course/course.service';
import { TopicService } from '../topic/topic.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class AiAgentService {
  public readonly geminiService: GeminiService;
  public readonly topicRepository: Repository<Topic>;
  private openAIModel: ChatOpenAI;
  private chain: RunnableSequence;
  private courseService: CourseService;
  private topicService: TopicService;

  constructor(geminiService: GeminiService, @InjectRepository(Topic) topicRepository: Repository<Topic>) {
    this.geminiService = geminiService;
    this.topicRepository = topicRepository;
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

  async generateFlashcards(prompt: string): Promise<Array<{front_text: string, back_text: string}>> {
    try {
      const flashcardPrompt = PromptTemplate.fromTemplate(prompt);
      const flashcardChain = RunnableSequence.from([flashcardPrompt, this.openAIModel]);
      
      const response = await flashcardChain.invoke({});
      
      // Convert response content to string
      const responseContent = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      // Parse JSON response
      const jsonMatch = responseContent.match(/```json([\s\S]*?)```/);
      if (jsonMatch) {
        const flashcards = JSON.parse(jsonMatch[1]);
        return Array.isArray(flashcards) ? flashcards : [];
      }
      
      // Fallback: try to parse JSON without markdown
      try {
        const flashcards = JSON.parse(responseContent);
        return Array.isArray(flashcards) ? flashcards : [];
      } catch (parseError) {
        Logger.error('Error parsing flashcard response:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      Logger.error('Error generating flashcards:', error);
      throw new Error('Failed to generate flashcards with AI');
    }
  }
}
