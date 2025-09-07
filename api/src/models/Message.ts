import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  statusMap: Map<string, 'sent' | 'delivered' | 'read'>;
}

export interface IMessageModel extends mongoose.Model<IMessage> {
  findConversationMessages(
    conversationId: string, 
    limit?: number, 
    before?: string
  ): Promise<IMessage[]>;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation ID is required']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  statusMap: {
    type: Map,
    of: String,
    default: new Map()
  }
}, {
  timestamps: false,
  toJSON: {
    transform: function(_doc, ret) {
      const { _id, id, ...messageWithoutId } = ret;
      return {
        id: _id.toString(),
        ...messageWithoutId
      };
    }
  }
});

// Compound index for efficient pagination
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

// Static methods
MessageSchema.statics.findConversationMessages = function(
  conversationId: string, 
  limit: number = 20, 
  before?: string
) {
  const query: any = { conversationId };
  
  if (before) {
    const beforeMessage = new mongoose.Types.ObjectId(before);
    query._id = { $lt: beforeMessage };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'name username avatarUrl');
};

export const MessageModel = mongoose.model<IMessage, IMessageModel>('Message', MessageSchema);
