import passport from 'passport';
import { UserModel } from '../models';
import { SessionService } from '../services/session.service';

const sessionStrategy = new (class extends passport.Strategy {
  name = 'session';
  
  authenticate(req: any, options?: any) {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      return this.fail('No session found');
    }

    SessionService.validateSession(sessionId)
      .then(async (sessionData) => {
        if (!sessionData) {
          return this.fail('Invalid or expired session');
        }

        const user = await UserModel.findById(sessionData.userId).select('-passwordHash');
        
        if (!user) {
          return this.fail('User not found');
        }

        await SessionService.updateSessionActivity(sessionId);

        return this.success(user);
      })
      .catch((error) => {
        return this.error(error);
      });
  }
})();

export const configurePassport = () => {
  passport.use('session', sessionStrategy);
};

export default passport;