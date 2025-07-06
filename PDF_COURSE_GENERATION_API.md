# PDF Course Generation API

## Overview

This API allows instructors to automatically generate course structures from PDF documents using Google's Gemini AI. The system analyzes PDF content and creates a structured course with topics and lessons.

## Prerequisites

1. **Google Gemini API Key**: Set the `GEMINI_API_KEY` environment variable
2. **Instructor Role**: User must have instructor role to access these endpoints
3. **Authentication**: JWT token required for all endpoints

## API Endpoints

### 1. Generate Course Structure from PDF

**Endpoint:** `POST /api/courses/generate-from-pdf`

**Description:** Analyzes a PDF file and generates a course structure with topics and lessons.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body:**
```
pdf: <file> (PDF document, max 10MB)
```

**Response:**
```json
{
  "course": {
    "title": "Generated Course Title",
    "description": "Course description based on PDF content",
    "categoryIds": [1, 2]
  },
  "topics": [
    {
      "title": "Topic Title",
      "description": "Topic description",
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "Lesson description"
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type, file too large, or PDF content extraction failed
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User is not an instructor

### 2. Create Course with Generated Structure

**Endpoint:** `POST /api/courses/create-with-structure`

**Description:** Creates a course with the generated structure, including topics and lessons.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body:**
```
course: {
  "title": "Course Title",
  "description": "Course Description",
  "categoryIds": [1, 2]
}
topics: [
  {
    "title": "Topic Title",
    "description": "Topic Description",
    "lessons": [
      {
        "title": "Lesson Title",
        "description": "Lesson Description"
      }
    ]
  }
]
thumbnail: <file> (optional - course thumbnail image, max 5MB)
videoIntro: <file> (optional - course intro video, max 100MB)
```

**Response:**
```json
{
  "message": "Course created successfully with generated structure",
  "course": {
    "id": 1,
    "title": "Course Title",
    "description": "Course Description",
    "instructor": {
      "id": 1,
      "username": "instructor_name"
    },
    "categories": [...],
    "topics": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Usage Examples

### Using cURL

**Generate Course Structure:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "pdf=@document.pdf" \
  http://localhost:3000/api/courses/generate-from-pdf
```

**Create Course with Structure:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "course={\"title\":\"My Course\",\"description\":\"Course description\",\"categoryIds\":[1]}" \
  -F "topics=[{\"title\":\"Topic 1\",\"description\":\"Topic description\",\"lessons\":[{\"title\":\"Lesson 1\",\"description\":\"Lesson description\"}]}]" \
  -F "thumbnail=@thumbnail.jpg" \
  http://localhost:3000/api/courses/create-with-structure
```

### Using JavaScript/Fetch

**Generate Course Structure:**
```javascript
const formData = new FormData();
formData.append('pdf', pdfFile);

const response = await fetch('/api/courses/generate-from-pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
  body: formData
});

const result = await response.json();
```

**Create Course with Structure:**
```javascript
const formData = new FormData();
formData.append('course', JSON.stringify(courseData));
formData.append('topics', JSON.stringify(topicsData));
if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
if (videoFile) formData.append('videoIntro', videoFile);

const response = await fetch('/api/courses/create-with-structure', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
  body: formData
});

const result = await response.json();
```

## Category IDs

The system uses the following category IDs:
- `1`: Technology
- `2`: Business
- `3`: Design
- `4`: Marketing
- `5`: Development

## Error Handling

The API includes comprehensive error handling:

1. **File Validation**: Checks file type, size, and format
2. **PDF Processing**: Handles PDF extraction errors gracefully
3. **AI Analysis**: Provides fallback structure if AI analysis fails
4. **Database Validation**: Validates instructor, categories, and relationships
5. **Authentication**: Ensures proper authorization for all operations

## Rate Limiting

- PDF analysis is limited to 10MB per file
- Thumbnail images are limited to 5MB
- Video intros are limited to 100MB
- AI processing has built-in token limits (8000 characters)
- Consider implementing rate limiting for production use

## Security Considerations

1. **File Upload**: Validates file types and sizes
2. **Authentication**: Requires valid JWT token with instructor role
3. **Input Validation**: Validates all input data using DTOs
4. **Error Messages**: Provides safe error messages without exposing internal details

## Environment Variables

Required environment variables:
```
GEMINI_API_KEY=your_google_gemini_api_key
```

## Future Enhancements

1. **Multiple File Formats**: Support for Word, PowerPoint, and other formats
2. **Custom AI Prompts**: Allow instructors to customize AI analysis
3. **Batch Processing**: Process multiple PDFs simultaneously
4. **Progress Tracking**: Real-time progress updates for large files
5. **Template System**: Pre-defined course templates for different subjects 