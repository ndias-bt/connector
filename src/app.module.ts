import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './configuration'; // this is new
import { RegistrationService } from './services/registration/registration.service';
import { OrgconfigsController } from './orgconfigs/orgconfigs.controller';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env`,
      load: [configuration],
    }),
    HttpModule,
  ],
  controllers: [AppController, OrgconfigsController],
  providers: [AppService, RegistrationService],
})
export class AppModule {}
