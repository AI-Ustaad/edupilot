import { ConfigurationDashboardService } from '@/services/configuration-dashboard.service';

const config = {
  school: { name: 'Test School', curriculumId: 'federal' },
  academic: { subjects: ['Math'] },
} as any;

function arrayRepository(records: unknown[] = []) {
  return { getAll: jest.fn().mockResolvedValue(records) };
}

describe('ConfigurationDashboardService', () => {
  test('counts unique class grades separately from the canonical section records', async () => {
    const sections = [
      { id: '10-a', classGrade: '10', sectionName: 'A' },
      { id: '10-b', classGrade: '10', sectionName: 'B' },
      { id: '11-a', classGrade: '11', sectionName: 'A' },
    ];
    const service = new ConfigurationDashboardService(
      { getConfiguration: jest.fn().mockResolvedValue(config) } as any,
      { findAllByTenant: jest.fn().mockResolvedValue([{ id: 'ay-1' }]) } as any,
      { getAll: jest.fn().mockResolvedValue(sections) } as any,
      { findAllActive: jest.fn().mockResolvedValue(sections) } as any,
      { count: jest.fn().mockResolvedValue(0) } as any,
      { findAll: jest.fn().mockResolvedValue([]) } as any,
      { findAll: jest.fn().mockResolvedValue([]) } as any,
      arrayRepository() as any, arrayRepository() as any, arrayRepository() as any, arrayRepository() as any, arrayRepository() as any, arrayRepository() as any,
      { getFeeStructures: jest.fn().mockResolvedValue([]) } as any,
      arrayRepository() as any, arrayRepository() as any, arrayRepository() as any, arrayRepository() as any,
    );

    const metrics = await service.getDashboardMetrics('tenant-a');

    expect(metrics.configuredClasses).toBe(2);
    expect(metrics.configuredSections).toBe(3);
  });
});
