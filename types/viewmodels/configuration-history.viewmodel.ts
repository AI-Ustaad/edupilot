// types/viewmodels/configuration-history.viewmodel.ts
import { BaseViewModel } from "./base.viewmodel";

export interface ConfigurationHistoryViewModel extends BaseViewModel {
  versionNumber: number;
  versionLabel: string; // e.g., "Version 3"
  reason: string;
  createdBy: string;
  createdAt: string;
  formattedDate: string; // e.g., "15 July 2026"
}
