import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  participants: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  unreadMessages: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  lastMessage?: {
    _id: mongoose.Types.ObjectId;
    text: string;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    createdAt: Date;
  };
}

export interface IConversationModel extends mongoose.Model<IConversation> {
  findConversation(userId1: string, userId2: string): Promise<IConversation | null>;
  findUserConversations(userId: string): Promise<IConversation[]>;
  incrementUnreadCount(conversationId: string, userId: string): Promise<IConversation | null>;
  resetUnreadCount(conversationId: string, userId: string): Promise<IConversation | null>;
  updateLastMessage(conversationId: string, messageData: {
    _id: mongoose.Types.ObjectId;
    text: string;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    createdAt: Date;
  }): Promise<IConversation | null>;
}

const ConversationSchema = new Schema<IConversation>({
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    validate: {
      validator: function(participants: mongoose.Types.ObjectId[]) {
        return participants.length === 2;
      },
      message: 'Exactly 2 participants are required'
    }
  },
  unreadMessages: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  lastMessage: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    text: {
      type: String,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderName: {
      type: String
    },
    createdAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      const { _id, id, ...conversationWithoutId } = ret;
      return {
        id: _id.toString(),
        ...conversationWithoutId
      };
    }
  }
});

ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ participants: 1 });

ConversationSchema.statics.findConversation = function(userId1: string, userId2: string) {
  return this.findOne({
    participants: { $all: [userId1, userId2] }
  });
};

ConversationSchema.statics.findUserConversations = function(userId: string) {
  return this.find({
    participants: userId
  }).sort({ lastMessageAt: -1, updatedAt: -1 });
};

ConversationSchema.statics.incrementUnreadCount = function(conversationId: string, userId: string) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      lastMessageAt: new Date(),
      $inc: { [`unreadMessages.${userId}`]: 1 }
    },
    { new: true }
  );
};

ConversationSchema.statics.resetUnreadCount = function(conversationId: string, userId: string) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      $unset: { [`unreadMessages.${userId}`]: 1 }
    },
    { new: true }
  );
};

ConversationSchema.statics.updateLastMessage = function(conversationId: string, messageData: {
  _id: mongoose.Types.ObjectId;
  text: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  createdAt: Date;
}) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      lastMessageAt: messageData.createdAt,
      lastMessage: messageData
    },
    { new: true }
  );
};

ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ConversationModel = mongoose.model<IConversation, IConversationModel>('Conversation', ConversationSchema);
