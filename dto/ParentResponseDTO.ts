export interface ParentResponseDTO {
  id: string;
  parentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  studentIds: string[];
  metadata?: any;
}
