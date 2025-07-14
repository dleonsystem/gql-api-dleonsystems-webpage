process.env.JWT_SECRET = 'testsecret';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../src/middlewares/auth';

describe('authMiddleware', () => {
  const dbMock = 'db';

  it('returns nulls when no token provided', async () => {
    const req = { headers: {}, db: dbMock } as any;
    const result = await authMiddleware({ req } as any);
    expect(result).toEqual({ usuarioId: null, rol: null, db: dbMock });
  });

  it('decodes valid token', async () => {
    const token = jwt.sign({ usuarioId: '1', rol: 'ADMIN' }, 'testsecret');
    const req = { headers: { authorization: `Bearer ${token}` }, db: dbMock } as any;
    const result = await authMiddleware({ req } as any);
    expect(result).toEqual({ usuarioId: '1', rol: 'ADMIN', db: dbMock });
  });

  it('handles invalid token gracefully', async () => {
    const req = { headers: { authorization: 'Bearer invalid' }, db: dbMock } as any;
    const result = await authMiddleware({ req } as any);
    expect(result).toEqual({ usuarioId: null, rol: null, db: dbMock });
  });
});
