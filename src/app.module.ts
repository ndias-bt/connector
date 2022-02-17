import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { RegistrationService } from './services/registration/registration.service';
import { configuration } from './configuration'; // this is new
import { OrgconfigsController } from './orgconfigs/orgconfigs.controller';
import * as Joi from 'joi';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
      load: [configuration],
      validationSchema: Joi.object({
        NAME: Joi.string().required(),
        DISPLAY_NAME: Joi.string().default(''),
        DESCRIPTION: Joi.string().default(''),
        COMPANY: Joi.string().default(''),
        VERSION: Joi.string().default('0.0.1'),
        RUN_ENVIRONMENT: Joi.string()
          .valid('gcp', 'development')
          .default('development'),
        BASE_URL: Joi.string().default('http://localhost'),
        IP_ADDRESS: Joi.string().default('127.0.0.1'),
        PORT: Joi.number().default(3000),
        REGISTRATION_URL: Joi.string().default(
          'https://connector-registry-xzww6y6oeq-uc.a.run.app/v1/connector',
        ),
      }),
    }),
    HttpModule,
  ],
  controllers: [AppController, OrgconfigsController],
  providers: [AppService, RegistrationService],
})
export class AppModule {}
