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

  constructor(
    geminiService: GeminiService, 
    @InjectRepository(Topic) topicRepository: Repository<Topic>,
    courseService: CourseService,
    topicService: TopicService
  ) {
    this.geminiService = geminiService;
    this.topicRepository = topicRepository;
    this.courseService = courseService;
    this.topicService = topicService;
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

  async previewCourseWithAI(courseId: number): Promise<{
    isValid: boolean;
    validationResults: {
      hasMinimumTopics: boolean;
      contentAppropriate: boolean;
      structureValid: boolean;
    };
    feedback: {
      topics: string[];
      content: string[];
      structure: string[];
      warnings: string[];
    };
    aiAnalysis: string;
  }> {
    try {
      // Get course with topics and lessons
      const course = await this.courseService.findOne(courseId);
      const topics = await this.topicRepository.find({
        where: { course: { id: courseId } },
        relations: ['lessons'],
      });

      // Basic validation
      const hasMinimumTopics = topics.length >= 1;
      
      // Prepare content for AI analysis
      const contentToAnalyze = {
        course: {
          title: course.title,
          description: course.description,
        },
        topics: topics.map(topic => ({
          title: topic.title,
          description: topic.description,
          lessons: topic.lessons?.map(lesson => ({
            title: lesson.title,
            description: lesson.description || '',
          })) || [],
        })),
      };

      // AI content validation prompt
      const validationPrompt = PromptTemplate.fromTemplate(`
        Analyze the following course content for appropriateness and educational value. 
        Check for:
        1. Inappropriate, offensive, or harmful content
        2. Educational quality and relevance
        3. Clear and professional language
        4. Proper course structure

        Course Content:
        {content}

        Respond in JSON format with the following structure:
        {{
          "isAppropriate": boolean,
          "contentQuality": "excellent|good|fair|poor",
          "issues": ["list of specific issues found"],
          "recommendations": ["list of improvement suggestions"],
          "overallAssessment": "string with detailed analysis"
        }}
      `);

      const validationChain = RunnableSequence.from([validationPrompt, this.openAIModel]);
      const validationResponse = await validationChain.invoke({ 
        content: JSON.stringify(contentToAnalyze, null, 2) 
      });

      // Parse AI response
      const responseContent = typeof validationResponse.content === 'string' 
        ? validationResponse.content 
        : JSON.stringify(validationResponse.content);
      
      const jsonMatch = responseContent.match(/```json([\s\S]*?)```/);
      let aiAnalysis: {
        isAppropriate?: boolean;
        contentQuality?: string;
        issues?: string[];
        recommendations?: string[];
        overallAssessment?: string;
      } = {};
      
      if (jsonMatch) {
        try {
          aiAnalysis = JSON.parse(jsonMatch[1]);
        } catch (error) {
          Logger.error('Error parsing AI validation response:', error);
          aiAnalysis = { overallAssessment: responseContent };
        }
      } else {
        aiAnalysis = { overallAssessment: responseContent };
      }

      // Structure validation
      const structureIssues: string[] = [];
      const structureWarnings: string[] = [];
      
      if (!hasMinimumTopics) {
        structureIssues.push('Course must have at least 1 topic');
      }

      // Check for empty topics (warning only, not validation failure)
      const emptyTopics = topics.filter(topic => !topic.lessons || topic.lessons.length === 0);
      if (emptyTopics.length > 0) {
        structureWarnings.push(`${emptyTopics.length} topic(s) have no lessons (recommended to add lessons for better learning experience)`);
      }

      // Determine overall validity (structure warnings don't fail validation)
      const contentAppropriate = aiAnalysis.isAppropriate !== false;
      const structureValid = structureIssues.length === 0; // Only critical issues fail validation
      const isValid = hasMinimumTopics && contentAppropriate && structureValid;

      return {
        isValid,
        validationResults: {
          hasMinimumTopics,
          contentAppropriate,
          structureValid,
        },
        feedback: {
          topics: hasMinimumTopics ? [] : ['Course must have at least 1 topic'],
          content: aiAnalysis.issues || [],
          structure: structureIssues,
          warnings: structureWarnings, // Add warnings for non-critical issues
        },
        aiAnalysis: aiAnalysis.overallAssessment || 'AI analysis completed',
      };

    } catch (error) {
      Logger.error('Error in previewCourseWithAI:', error);
      throw new Error('Failed to preview course with AI');
    }
  }
}
