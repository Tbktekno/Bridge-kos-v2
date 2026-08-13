export interface UpdateTenantInput {
  nickname?: string | null;
  emergencyContact?: string | null;
  preferences?: Record<string, unknown>;
}
