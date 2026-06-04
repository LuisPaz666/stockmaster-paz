import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sslCaPath = config.get<string>('DB_SSL_CA');

        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          entities: ['dist/**/*.entity.js'],
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') !== 'production',
          ssl: sslCaPath && fs.existsSync(sslCaPath)
            ? {
                ca: fs.readFileSync(sslCaPath).toString(),
                rejectUnauthorized: true,
              }
            : sslCaPath
              ? { rejectUnauthorized: false }
              : undefined,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
