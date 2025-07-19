import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GeneratedCourseDto,
  GeneratedTopicDto,
} from '../course/dto/request/generate-course-from-pdf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async analyzePdfContent(pdfText: string): Promise<{
    course: GeneratedCourseDto;
    topics: GeneratedTopicDto[];
  }> {
    try {
      const categories = await this.categoryRepository.find({
        select: ['id', 'name'],
      });
      const categoryList = categories
        .map((cat) => `id: ${cat.id}, name: ${cat.name}`)
        .join('; ');

      const prompt = this.buildAnalysisPrompt(pdfText, categoryList);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      const parsedResult = this.parseAIResponse(text);
      return parsedResult;
    } catch (error) {
      this.logger.error('Error analyzing PDF content:', error);
      throw new Error('Failed to analyze PDF content');
    }
  }

  async generateFlashcards(
    prompt: string,
  ): Promise<Array<{ front_text: string; back_text: string }>> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      console.log(text);
      const flashcards = this.parseFlashcardResponse(text);
      return flashcards;
    } catch (error) {
      this.logger.error('Error generating flashcards:', error);
      throw new Error('Failed to generate flashcards');
    }
  }

  private buildAnalysisPrompt(pdfText: string, categoryList: string): string {
    return `
      You are an expert course designer. Analyze the following PDF content and create a structured course outline.

      PDF Content:
      ${pdfText.substring(0, 8000)} // Limit to first 8000 characters to avoid token limits

      Please create a JSON response with the following structure:
      {
        "course": {
          "title": "Course title based on content",
          "description": "Comprehensive course description",
          "categoryIds": [1, 2] // Array of category IDs (see below)
        },
        "topics": [
          {
            "title": "Topic title",
            "description": "Topic description",
            "lessons": [
              {
                "title": "Lesson title",
                "description": "Lesson description"
              }
            ]
          }
        ]
      }

      Guidelines:
      1. Create 3-5 main topics based on the content structure
      2. Each topic should have 2-4 lessons
      3. Use clear, descriptive titles and descriptions
      4. Categorize the course appropriately. **The categoryIds array must have at least 2 IDs chosen from the list.** Here is the list of available categories: ${categoryList}
      5. Ensure the structure is logical and follows educational best practices

      Return only the JSON response, no additional text.
      `;
  }

  private parseAIResponse(response: string): {
    course: GeneratedCourseDto;
    topics: GeneratedTopicDto[];
  } {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!parsed.course || !parsed.topics) {
        throw new Error('Invalid response structure from AI');
      }

      return {
        course: parsed.course,
        topics: parsed.topics,
      };
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      // Return a fallback structure
      return this.getFallbackStructure();
    }
  }

  private getFallbackStructure(): {
    course: GeneratedCourseDto;
    topics: GeneratedTopicDto[];
  } {
    return {
      course: {
        title: 'Generated Course',
        description:
          'Course generated from PDF content. Please review and customize.',
        categoryIds: [1], // Default to Technology
        topics: [],
      },
      topics: [
        {
          title: 'Introduction',
          description: 'Introduction to the course content',
          lessons: [
            {
              title: 'Course Overview',
              description: 'Overview of what will be covered in this course',
            },
          ],
        },
      ],
    };
  }

  private parseFlashcardResponse(
    response: string,
  ): Array<{ front_text: string; back_text: string }> {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Try to find JSON object with markdown
        const jsonObjectMatch = response.match(/```json([\s\S]*?)```/);
        if (jsonObjectMatch) {
          const flashcards = JSON.parse(jsonObjectMatch[1]);
          return Array.isArray(flashcards) ? flashcards : [];
        }
        throw new Error('No valid JSON array found in AI response');
      }

      const flashcards = JSON.parse(jsonMatch[0]);

      // Validate that it's an array of objects with front_text and back_text
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }

      // Validate each flashcard has required fields
      const validFlashcards = flashcards.filter(
        (card) =>
          card &&
          typeof card.front_text === 'string' &&
          typeof card.back_text === 'string',
      );

      return validFlashcards;
    } catch (error) {
      this.logger.error('Error parsing flashcard response:', error);
      // Return fallback flashcards
      return this.getFallbackFlashcards();
    }
  }

  private getFallbackFlashcards(): Array<{
    front_text: string;
    back_text: string;
  }> {
    return [
      {
        front_text: 'What is the main topic?',
        back_text: 'The main topic is the primary subject being discussed.',
      },
      {
        front_text: 'What are the key concepts?',
        back_text: 'Key concepts are the fundamental ideas and principles.',
      },
      {
        front_text: 'What is the definition?',
        back_text: 'A definition explains the meaning of a term or concept.',
      },
    ];
  }
}
