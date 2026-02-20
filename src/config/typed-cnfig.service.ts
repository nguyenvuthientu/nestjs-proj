import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config.type';

export class TypedConfigService extends ConfigService<ConfigType> {}
