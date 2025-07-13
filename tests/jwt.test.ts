import JWT from '../src/lib/jwt';

beforeAll(() => {
  process.env.SECRET = 'testsecret';
  process.env.DURACIONTOKEN = '3600';
});

describe('JWT helper', () => {
  it('signs and verifies tokens', () => {
    const jwtHelper = new JWT();
    const token = jwtHelper.sign({ user: 'tester' });
    const decoded: any = jwtHelper.verify(token);
    expect((decoded as any).user).toBe('tester');
  });
});
