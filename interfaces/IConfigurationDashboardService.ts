export interface ConfigurationDashboardMetrics {
  schoolInfo: Record<string, any> | null;
  academicYearCount: number;
  configuredClasses: number;
  configuredSections: number;
  configuredSubjects: number;
  configuredTeachers: number;
  configuredStaff: number;
  configuredStudents: number;
  configuredParents: number;
  configuredRooms: number;
  configuredBuildings: number;
  configuredFacilities: number;
  libraryStatus: string;
  transportStatus: string;
  hostelStatus: string;
  feeConfiguration: string;
  configurationCompletion: {
    percentage: number;
    total: number;
    completed: number;
    missing: string[];
  };
  warnings: string;
  missingConfigurations: string[];
  totalCount: number;
  completedCount: number;
}

export interface IConfigurationDashboardService {
  getDashboardMetrics(tenantId: string): Promise<ConfigurationDashboardMetrics>;
  refreshDashboardStats(tenantId: string): Promise<void>;
}