import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from "../models";
import { CreateUserRequest } from "../types/user.types";
import { AuthResponseDTO } from "../dtos/auth.dto";
import { ConflictError, AuthError, UserNotFoundError } from '../errors';
import { LoginRequest } from '../types/auth.types';


const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

export class AuthService {
  static async register(createUserRequest: CreateUserRequest): Promise<AuthResponseDTO> {
    const { name, username, password } = createUserRequest;
    
    if (await UserModel.userExists(username)) throw new ConflictError('Username already exists');

    const passwordHash = await this.hashPassword(password);

    const user = await UserModel.create({
      name: name,
      username: username,
      passwordHash: passwordHash,
    });
    const tokens = this.generateTokens(user._id.toString());

    return new AuthResponseDTO(user, tokens);
  }

  static async login(loginRequest: LoginRequest): Promise<AuthResponseDTO> {
    const { username, password } = loginRequest;
    
    const user = await UserModel.findOneWithPassword({ username: username.toLowerCase() });
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

    return new AuthResponseDTO(user, tokens);
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponseDTO> {
    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as any;
      
      if (!payload.sub) {
        throw new AuthError('Invalid refresh token');
      }
      const user = await UserModel.findByIdWithPassword(payload.sub);
      if (!user) {
        throw new UserNotFoundError('User not found');
      }

      const tokens = this.generateTokens(user._id.toString());

      return new AuthResponseDTO(user, tokens);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid or expired refresh token');
      }
      throw error;
    }
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
      refreshToken
    };
  };
  
  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

}

