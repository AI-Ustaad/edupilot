export interface VideoLecture {
  id: string;
  title: string;
  description?: string;
  classGrade: string;
  subject: string;
  videoUrl: string;
  createdBy: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
}
