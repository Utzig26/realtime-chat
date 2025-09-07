import { Types } from 'mongoose';

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  createdAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateSessionRequest {
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionResponse {
  sessionId: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
  createdAt: Date;
  lastActivity: Date;
}


export interface AuthenticatedRequest extends Express.Request {
  sessionId: string;
  sessionData: SessionData;
  user: {
    _id: Types.ObjectId;
    username: string;
    name: string;
    email?: string;
    lastSeen?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

