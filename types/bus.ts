export interface Bus {
  id: string;
  tenantId: string;
  busNumber: string;        // e.g., "BUS-01"
  route: string;            // e.g., "Route A"
  driverName?: string;
  driverContact?: string;
  capacity?: number;
  createdAt: Date;
  updatedAt?: Date;
}
