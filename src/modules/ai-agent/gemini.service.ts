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
}
