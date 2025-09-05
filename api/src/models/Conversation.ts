import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  participants: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export interface IConversationModel extends mongoose.Model<IConversation> {
  findConversation(userId1: string, userId2: string): Promise<IConversation | null>;
  findUserConversations(userId: string): Promise<IConversation[]>;
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: false,
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
ConversationSchema.index({ participants: 1 }, { unique: true });

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

ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ConversationModel = mongoose.model<IConversation, IConversationModel>('Conversation', ConversationSchema);
