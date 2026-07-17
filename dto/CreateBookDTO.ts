// dto/CreateBookDTO.ts
import { CreateBookInput } from "@/validators/teacher";

export type CreateBookDTO = CreateBookInput & {
  tenantId: string;
};
