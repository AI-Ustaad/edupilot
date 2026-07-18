// lib/commands/configuration-commands.ts

export class PublishConfigurationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly reason?: string
  ) {}
}

export class ValidateConfigurationCommand {
  constructor(
    public readonly tenantId: string
  ) {}
}

export class LockConfigurationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly reason: string
  ) {}
}

export class ArchiveConfigurationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string
  ) {}
}
