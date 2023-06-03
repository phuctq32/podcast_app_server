import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashService {
  private salt: number;
  constructor() {
    this.salt = 12;
  }

  setSalt(salt: number): void {
    this.salt = salt;
  }

  hash(password): string {
    return bcrypt.hashSync(password, this.salt);
  }

  compare(str: string, hashed: string): boolean {
    return bcrypt.compareSync(str, hashed);
  }
}
