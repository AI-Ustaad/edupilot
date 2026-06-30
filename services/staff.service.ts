=================================================================
services/staff.service.ts میں صرف import line تبدیل کریں
=================================================================

اپنی services/staff.service.ts میں یہ ڈھونڈیں:

import {
  CreateStaffSchema,
  UpdateStaffSchema,
} from "@/lib/validation";

اسے اس سے بدلیں:

import {
  createStaffSchema as CreateStaffSchema,
  updateStaffSchema as UpdateStaffSchema,
} from "@/lib/validation";

یا سادہ طریقہ — بس lowercase استعمال کریں:

import {
  createStaffSchema,
  updateStaffSchema,
} from "@/lib/validation";

اور باقی فائل میں CreateStaffSchema.parse(...) کی جگہ
createStaffSchema.parse(...) لکھیں۔

=================================================================
