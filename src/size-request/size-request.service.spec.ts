import { Test, TestingModule } from '@nestjs/testing';
import { SizeRequestService } from './size-request.service';

describe('SizeRequestService', () => {
  let service: SizeRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SizeRequestService],
    }).compile();

    service = module.get<SizeRequestService>(SizeRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
