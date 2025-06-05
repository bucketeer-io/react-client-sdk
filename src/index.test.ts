import { hello } from './index';

describe('hello function', () => {
  it('should return greeting message', () => {
    expect(hello()).toBe('Hello from Bucketeer React Client SDK!');
  });
});
