import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('googleOAuth.clientId'),
      clientSecret: configService.get<string>('googleOAuth.clientSecret'),
      callbackURL: `${configService.get<string>(
        'DOMAIN',
      )}/api/v1/auth/google/redirect`,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    this.logger.debug(`${JSON.stringify({ accessToken, refreshToken })}`);

    const user = {
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0].value,
      is_verified: true,
    };

    done(null, user);
  }
}
