export interface TransportDocument {
  id?: string;
  routeName: string;
  vehicleId?: string;
  driverName?: string;
  driverPhone?: string;
  pickupPoints: string[];
  dropoffPoints: string[];
  schedule: string;
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
