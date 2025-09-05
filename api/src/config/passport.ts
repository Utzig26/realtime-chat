import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserModel } from '../models';
import { AuthError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const jwtOptions = {
  // Try to extract from cookies, if not, try to extract from Authorization header
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      return req.cookies?.accessToken || null;
    },
    ExtractJwt.fromAuthHeaderAsBearerToken()
  ]),
  secretOrKey: JWT_SECRET
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload: any, done: any) => {
  try {
    const userId = payload.sub;
    
    if (!userId) {
      return done(new AuthError('Invalid token payload'), false);
    }

    const user = await UserModel.findById(userId).select('-passwordHash');
    
    if (!user) {
      return done(new AuthError('User not found'), false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});

export const configurePassport = () => {
  passport.use('jwt', jwtStrategy);
};

export default passport;