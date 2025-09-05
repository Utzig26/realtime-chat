import mongoose, { Document, Schema, Query } from 'mongoose';
import { User } from '../types/user.types';

export interface IUser extends User, Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  passwordHash: string;
}

export interface IUserModel extends mongoose.Model<IUser> {
  userExists(username: string): Promise<boolean>;
  findByIdWithPassword(id: string): Query<IUser | null, IUser>;
  findOneWithPassword(conditions: any): Query<IUser | null, IUser>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: null
  },
  avatarUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(url: string) {
        if (!url) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'Avatar URL must be a valid image URL'
    }
  }
}, {
  timestamps: false,
  toJSON: {
    transform: function(_doc, ret) {
      const { passwordHash, _id, id, ...userWithoutPassword } = ret;
      return {
        id: _id.toString(),
        ...userWithoutPassword
      };
    }
  }
});

UserSchema.index({ username: 1 });
UserSchema.index({ lastSeen: -1 });

UserSchema.set('toJSON', { virtuals: false });

UserSchema.statics.userExists = function(username: string): Promise<boolean> {
  return this.findOne({ username }).then((user: IUser | null) => user !== null);
};

UserSchema.statics.findByIdWithPassword = function(id: string) {
  return this.findById(id).select('+passwordHash');
};

UserSchema.statics.findOneWithPassword = function(conditions: any) {
  return this.findOne(conditions).select('+passwordHash');
};

export const UserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);
