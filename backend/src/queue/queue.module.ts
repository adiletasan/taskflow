import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const isSecure = redisUrl.startsWith('rediss://');

        // Парсим URL вручную без new URL()
        const withoutProtocol = redisUrl.replace(/^rediss?:\/\//, '');
        const atIndex = withoutProtocol.lastIndexOf('@');
        const hostPart = atIndex >= 0 ? withoutProtocol.slice(atIndex + 1) : withoutProtocol;
        const credPart = atIndex >= 0 ? withoutProtocol.slice(0, atIndex) : '';
        const colonInHost = hostPart.lastIndexOf(':');
        const host = colonInHost >= 0 ? hostPart.slice(0, colonInHost) : hostPart;
        const port = colonInHost >= 0 ? parseInt(hostPart.slice(colonInHost + 1)) : 6379;
        const colonInCred = credPart.indexOf(':');
        const password = colonInCred >= 0 ? credPart.slice(colonInCred + 1) : credPart;

        return {
          redis: {
            host,
            port,
            password: password || undefined,
            tls: isSecure ? {} : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}