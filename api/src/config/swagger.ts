import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Realtime Chat API',
      version: '1.0.0',
      description: 'A comprehensive realtime chat application API with authentication, messaging, and conversation management',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Validation error details']
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              example: 'johndoe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'General Chat'
            },
            type: {
              type: 'string',
              enum: ['direct', 'group'],
              example: 'group'
            },
            participants: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            content: {
              type: 'string',
              example: 'Hello, how are you?'
            },
            sender: {
              $ref: '#/components/schemas/User'
            },
            conversation: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            type: {
              type: 'string',
              enum: ['text', 'image', 'file'],
              example: 'text'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Session: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            user: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            ipAddress: {
              type: 'string',
              example: '192.168.1.1'
            },
            userAgent: {
              type: 'string',
              example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            lastActivity: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        }
      }
    },
    security: [
      {
        sessionAuth: []
      }
    ]
  },
  apis: [
    './src/docs/*.ts',
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/schemas/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Realtime Chat API Documentation'
  }));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;
