import { HttpAuthGuard } from './httpauth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new HttpAuthGuard()).toBeDefined();
  });
});
