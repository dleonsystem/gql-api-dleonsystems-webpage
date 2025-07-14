import { contentQueries } from '../src/resolvers/queries/content';

describe('contentQueries.portfolio', () => {
  it('returns language specific data', async () => {
    const mockFindOne = jest.fn().mockResolvedValue({ en: ['a'], es: ['b'] });
    const mongo = { collection: jest.fn().mockReturnValue({ findOne: mockFindOne }) } as any;
    const result = await contentQueries.portfolio(undefined, { language: 'es' }, { mongo } as any);
    expect(result).toEqual(['b']);
    expect(mongo.collection).toHaveBeenCalledWith('portfolio');
  });

  it('returns empty array when no data', async () => {
    const mockFindOne = jest.fn().mockResolvedValue(null);
    const mongo = { collection: jest.fn().mockReturnValue({ findOne: mockFindOne }) } as any;
    const result = await contentQueries.portfolio(undefined, { language: 'es' }, { mongo } as any);
    expect(result).toEqual([]);
  });
});
