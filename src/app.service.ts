import { Injectable } from '@nestjs/common';
import { AppConfig } from './config/app.config';
import { TypedConfigService } from './config/typed-cnfig.service';

@Injectable()
export class AppService {
  constructor(private readonly configService: TypedConfigService) {}
  getHello(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const prefix = this.configService.get<AppConfig>('app')?.messagePrefix;
    return `${prefix} + Hello World`;
  }
}
