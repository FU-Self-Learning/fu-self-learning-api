<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Chatbot Mentor AI API

### Endpoint

```
POST /chatbot
```

### Mục đích
Gửi tin nhắn hội thoại tới chatbot Mentor AI, nhận lại câu trả lời và (nếu phù hợp) gợi ý các khoá học. Bot sẽ nhớ ngữ cảnh các lượt chat trước đó theo session/user.

### Request

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>` (bắt buộc, user phải đăng nhập)

**Body** (`application/json`):
```json
{
  "message": "string",         // (bắt buộc) Nội dung tin nhắn người dùng gửi cho bot
  "sessionId": "string"        // (tùy chọn) ID phiên chat, dùng để lưu và lấy history (nên truyền từ FE, ví dụ: uuid, hoặc userId)
}
```
- Nếu không truyền `sessionId`, backend sẽ tự động dùng `userId` của người dùng làm session.

**Ví dụ:**
```json
{
  "message": "Tôi muốn học về trí tuệ nhân tạo, có khoá nào phù hợp không?",
  "sessionId": "abc123-session-uuid"
}
```

### Response

**Thành công** (`200 OK`):
```json
{
  "response": "string",        // Câu trả lời của bot (Mentor AI)
  "courses": [                 // (Có thể có) Danh sách khoá học gợi ý nếu intent liên quan khoá học
    {
      "id": 1,
      "title": "Khoá học Python cơ bản",
      "description": "Học lập trình Python từ đầu...",
      "categories": ["Lập trình", "Python"]
    }
    // ... các khoá học khác
  ],
  "timestamp": "2024-06-09T12:34:56.789Z" // Thời gian trả lời
}
```
- Nếu user chỉ hỏi thông thường, trường `courses` có thể không xuất hiện hoặc là mảng rỗng.

**Lỗi** (`4xx/5xx`):
```json
{
  "statusCode": 400,
  "message": "Nội dung lỗi chi tiết",
  "error": "Bad Request"
}
```

### Lưu ý về context/history
- Bot sẽ tự động nhớ tối đa 10 lượt chat gần nhất theo `sessionId` (hoặc `userId`).
- FE chỉ cần truyền đúng `sessionId` cho mỗi phiên chat, không cần truyền lại toàn bộ history.

### Tóm tắt các param

| Tên        | Kiểu     | Bắt buộc | Mô tả                                    |
|------------|----------|----------|-------------------------------------------|
| message    | string   | Có       | Tin nhắn người dùng gửi cho bot           |
| sessionId  | string   | Không    | ID phiên chat (nên truyền để lưu history) |

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

### Memory Optimization

This project has been configured to handle memory issues during deployment. The following optimizations have been implemented:

- **Node.js Memory Limits**: Set to 2GB for production and 4GB for build
- **Multi-stage Docker Build**: Optimized for smaller production images
- **Health Check Endpoint**: Available at `/health` for monitoring

### Local Development

```bash
# Install dependencies
$ yarn install

# Development mode
$ yarn run start:dev

# Production mode (with memory optimization)
$ yarn run start:prod
```

### Docker Deployment

```bash
# Build and run with Docker Compose
$ docker-compose up --build

# Production deployment
$ docker-compose -f docker-compose.prod.yml up --build

# Or use the deployment script
$ ./deploy.bat docker  # Windows
$ ./deploy.sh docker   # Linux/Mac
```

### Render.com Deployment

For Render.com deployment, use the following settings:

**Option 1: Using render.yaml (Recommended)**
- The `render.yaml` file is already configured for automatic deployment
- Just connect your GitHub repository to Render

**Option 2: Manual Configuration**
- **Build Command**: `yarn install && yarn build`
- **Start Command**: `yarn start`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `NODE_OPTIONS=--max-old-space-size=2048`
  - `PORT=3000`

**Important Notes:**
- The `start` script now includes memory optimization by default
- Health check endpoint available at `/health`
- Make sure to set the environment variables in Render dashboard

### Memory Troubleshooting

If you encounter memory issues:

1. **Increase memory allocation**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Use production build**:
   ```bash
   yarn build
   yarn start:prod
   ```

3. **Check health endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# music_api
#   f u - s e l f - l e a r n i n g - a p i 
 
 