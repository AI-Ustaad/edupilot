export interface LibraryDocument {
  id?: string;
  name: string;
  location: string;
  capacity: number;
  openHours: string;
  librarianId?: string;
  tenantId: string;
  deleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
  metadata?: {
    version?: number;
    createdBy?: string;
    updatedBy?: string;
    source?: string;
  };
  [key: string]: any;
}
