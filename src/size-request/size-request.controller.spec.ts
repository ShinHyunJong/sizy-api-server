import { Test, TestingModule } from '@nestjs/testing';
import { SizeRequestController } from './size-request.controller';
import { SizeRequestService } from './size-request.service';

describe('SizeRequestController', () => {
  let controller: SizeRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeRequestController],
      providers: [SizeRequestService],
    }).compile();

    controller = module.get<SizeRequestController>(SizeRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
