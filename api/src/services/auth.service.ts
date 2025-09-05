import bcrypt from 'bcryptjs';
import { UserModel } from "../models";
import { CreateUserRequest, LoginRequest, User } from "../types/user.types";
import jwt from 'jsonwebtoken';
import { ConflictError, AuthError } from '../errors';


const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthService {
  static async register(createUserRequest: CreateUserRequest): Promise<any> {
    const { name, username, password } = createUserRequest;
    
    if (await this.checkIfUserExists(username)) {
      throw new ConflictError('Username already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    createUserRequest.password = hashedPassword;

    const user = await UserModel.create({
      name: name,
      username: username,
      passwordHash: hashedPassword,
    });
    const tokens = this.generateTokens(user._id.toString());

    return {user, tokens};
  }

  static async login(loginRequest: LoginRequest): Promise<any> {
    const { username, password } = loginRequest;
    
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new AuthError('Invalid username or password');
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthError('Invalid username or password');
    }

    user.lastSeen = new Date();
    await user.save();

    const tokens = this.generateTokens(user._id.toString());

    return { user, tokens };
  }

  // private methods
  private static generateTokens(userId: string) {

    const accessToken = jwt.sign(
      { sub: userId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { sub: userId, t: Date.now() },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60
    };
  };

  private static async checkIfUserExists(username: string): Promise<boolean> {
    const userExists = await UserModel.findOne({ username }) !== null;
    return userExists;
  }
  
  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }


}

