// interfaces/ITenantSetupRepository.ts
export interface ITenantSetupRepository {
  setupSchool(input: {
    userId: string;
    tenantId: string;
    schoolName: string;
    type?: string;
    curriculum?: string;
    classes: any[];
    subjects: string[];
  }): Promise<void>;
}
