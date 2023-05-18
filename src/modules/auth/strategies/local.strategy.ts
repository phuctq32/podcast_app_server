import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import UserLoginDto from '../dto/user-login.dto';
import { Strategy } from 'passport-local';
import { BadRequestException, Body, Injectable, Request } from '@nestjs/common';
import { JwtPayload } from '../../../common/jwt/jwt-payload.interface';
import { validate } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const userDto: UserLoginDto = { email, password };
    const errors = await validate(userDto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    const user = await this.authService.validateUser(userDto);

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    return payload;
  }
}
