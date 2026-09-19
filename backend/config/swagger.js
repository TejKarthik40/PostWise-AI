const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PostWise-AI REST API Documentation',
      version: '1.0.0',
      description: 'API Specification for PostWise-AI Social Media Content Calendar Generator, including Auth, Brands, Calendars, Posts, Pexels Media, and LinkedIn Publishing.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Bearer token obtained from /api/auth/login or /api/auth/register',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Alex Brand Manager' },
                    email: { type: 'string', example: 'alex@example.com' },
                    password: { type: 'string', example: 'securepassword123' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully with JWT token' },
            400: { description: 'Validation error or email already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate user & retrieve token',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'alex@example.com' },
                    password: { type: 'string', example: 'securepassword123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            400: { description: 'Invalid email or password' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Fetch current authenticated user profile',
          tags: ['Auth'],
          responses: {
            200: { description: 'Authenticated user profile' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/brands': {
        get: {
          summary: 'Get list of brand profiles',
          tags: ['Brands'],
          responses: {
            200: { description: 'List of brands for authenticated user' },
          },
        },
        post: {
          summary: 'Create a new brand profile',
          tags: ['Brands'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'EcoGlow Organics' },
                    industry: { type: 'string', example: 'Sustainable Wellness' },
                    targetAudience: { type: 'string', example: 'Eco-conscious consumers' },
                    tone: { type: 'string', example: 'Inspirational' },
                    platforms: { type: 'array', items: { type: 'string' }, example: ['Instagram', 'LinkedIn', 'X'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Brand profile created' },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/calendars/generate': {
        post: {
          summary: 'Generate 30-day AI social media calendar (Synchronous)',
          tags: ['Calendars'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['brandId'],
                  properties: {
                    brandId: { type: 'string', example: 'mock_brand_ecoglow' },
                    startDate: { type: 'string', example: '2026-10-01' },
                    topicNiche: { type: 'string', example: 'Eco Skincare' },
                    goals: { type: 'string', example: 'Brand Awareness' },
                    platforms: { type: 'array', items: { type: 'string' }, example: ['Instagram', 'LinkedIn', 'X'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Content calendar generated successfully' },
            400: { description: 'Validation error or missing brandId' },
          },
        },
      },
      '/api/calendars/generate-async': {
        post: {
          summary: 'Initiate background asynchronous AI calendar generation',
          tags: ['Calendars'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['brandId'],
                  properties: {
                    brandId: { type: 'string', example: 'mock_brand_ecoglow' },
                    startDate: { type: 'string', example: '2026-10-01' },
                  },
                },
              },
            },
          },
          responses: {
            202: { description: 'Job accepted' },
          },
        },
      },
      '/api/calendars/jobs/{jobId}': {
        get: {
          summary: 'Poll status of background calendar generation job',
          tags: ['Calendars'],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Job status details and result if completed' },
            404: { description: 'Job not found' },
          },
        },
      },
      '/api/calendars/{id}/export/json': {
        get: {
          summary: 'Export calendar as JSON download',
          tags: ['Calendars'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'JSON download file' },
          },
        },
      },
      '/api/calendars/{id}/export/csv': {
        get: {
          summary: 'Export calendar as CSV download',
          tags: ['Calendars'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'CSV download file' },
          },
        },
      },
      '/api/posts/{id}/regenerate': {
        post: {
          summary: 'Regenerate content for a single post using AI',
          tags: ['Posts'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    customInstruction: { type: 'string', example: 'Make it punchier with a question hook' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Post regenerated successfully' },
          },
        },
      },
      '/api/posts/{id}/publish/linkedin': {
        post: {
          summary: 'Publish scheduled post directly to LinkedIn feed',
          tags: ['Posts'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Post published to LinkedIn' },
            401: { description: 'LinkedIn authorization required' },
          },
        },
      },
      '/api/health': {
        get: {
          summary: 'Server & database health check',
          tags: ['System'],
          security: [],
          responses: {
            200: { description: 'Server operational details' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;
