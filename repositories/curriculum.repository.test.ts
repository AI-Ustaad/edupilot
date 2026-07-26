import { CurriculumRepository } from '@/repositories/curriculum.repository';

jest.mock('@/lib/data/master-catalog.data', () => ({
  MASTER_CATALOG: [
    {
      id: 'country-1',
      name: 'Country 1',
      systems: [
        {
          id: 'system-1',
          name: 'System 1',
          authorities: [
            {
              id: 'authority-1',
              name: 'Authority 1',
              curriculumVersions: [
                { id: 'version-1', name: 'Version 1', year: 2024 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'country-2',
      name: 'Country 2',
      systems: [],
    },
  ],
}));

describe('CurriculumRepository', () => {
  let repo: CurriculumRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new CurriculumRepository();
  });

  test('should get all countries', async () => {
    const countries = await repo.getAllCountries();
    expect(countries).toHaveLength(2);
  });

  test('should get a country by id', async () => {
    const country = await repo.getCountry('country-1');
    expect(country).toBeDefined();
    expect(country!.id).toBe('country-1');
  });

  test('should return undefined for non-existent country', async () => {
    const country = await repo.getCountry('nonexistent');
    expect(country).toBeUndefined();
  });

  test('should get a system by country and system id', async () => {
    const system = await repo.getSystem('country-1', 'system-1');
    expect(system).toBeDefined();
    expect(system!.id).toBe('system-1');
  });

  test('should return undefined for non-existent system', async () => {
    const system = await repo.getSystem('country-1', 'nonexistent');
    expect(system).toBeUndefined();
  });

  test('should return undefined for non-existent country system', async () => {
    const system = await repo.getSystem('country-2', 'system-1');
    expect(system).toBeUndefined();
  });

  test('should get an authority by country, system, and authority id', async () => {
    const authority = await repo.getAuthority('country-1', 'system-1', 'authority-1');
    expect(authority).toBeDefined();
    expect(authority!.id).toBe('authority-1');
  });

  test('should return undefined for non-existent authority', async () => {
    const authority = await repo.getAuthority('country-1', 'system-1', 'nonexistent');
    expect(authority).toBeUndefined();
  });

  test('should get a curriculum version', async () => {
    const version = await repo.getCurriculumVersion('country-1', 'system-1', 'authority-1', 'version-1');
    expect(version).toBeDefined();
    expect(version!.id).toBe('version-1');
  });

  test('should return undefined for non-existent curriculum version', async () => {
    const version = await repo.getCurriculumVersion('country-1', 'system-1', 'authority-1', 'nonexistent');
    expect(version).toBeUndefined();
  });
});