process.env.JWT_SECRET = 'testsecret';
process.env.DURACIONTOKEN = '3600';

import JWT from '../src/lib/jwt';

describe('JWT helper', () => {
  it('signs and verifies tokens', () => {
    const jwtHelper = new JWT();
    const token = jwtHelper.sign({ user: 'tester' });
    const decoded: any = jwtHelper.verify(token);
    expect((decoded as any).user).toBe('tester');
  });
});
