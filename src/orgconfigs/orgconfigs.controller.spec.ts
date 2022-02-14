import { Test, TestingModule } from '@nestjs/testing';
import { OrgconfigsController } from './orgconfigs.controller';

describe('OrgconfigsController', () => {
  let controller: OrgconfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgconfigsController],
    }).compile();

    controller = module.get<OrgconfigsController>(OrgconfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
