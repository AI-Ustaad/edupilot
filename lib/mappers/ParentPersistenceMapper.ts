import type { CreateParentDTO, UpdateParentDTO } from "@/dto";
import type { ParentEntity } from "@/entities/parent.entity";
import type { ParentDocument } from "@/documents/ParentDocument";

export class ParentPersistenceMapper {
  static fromDTO(dto: Partial<CreateParentDTO>): Partial<ParentEntity> {
    return {
      identity: {
        userId: dto.userId || "",
      },
      personal: {
        fullName: dto.fullName || "",
        email: dto.email,
        phone: dto.phone,
      },
      relationships: {
        studentIds: dto.studentIds || [],
      },
      metadata: {
        version: dto.metadata?.version || 1,
        source: dto.metadata?.source,
      },
    };
  }

  static toFirestore(entity: Partial<ParentEntity>, userId: string): ParentDocument {
    return {
      userId: entity.identity?.userId || "",
      name: entity.personal?.fullName || "",
      email: entity.personal?.email,
      phone: entity.personal?.phone,
      studentIds: entity.relationships?.studentIds || [],
      metadata: {
        version: entity.metadata?.version || 1,
        source: entity.metadata?.source,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  static fromFirestore(doc: ParentDocument): ParentEntity {
    return {
      parentId: doc.id || "",
      id: doc.id || "",
      identity: {
        userId: doc.userId || "",
      },
      personal: {
        fullName: doc.name || "",
        email: doc.email,
        phone: doc.phone,
      },
      relationships: {
        studentIds: doc.studentIds || [],
      },
      metadata: {
        version: doc.metadata?.version ?? 1,
        source: doc.metadata?.source ?? "web",
        createdBy: doc.metadata?.createdBy,
        updatedBy: doc.metadata?.updatedBy,
        createdAt: doc.metadata?.createdAt,
        updatedAt: doc.metadata?.updatedAt,
      },
      tenantId: doc.tenantId,
      createdBy: doc.metadata?.createdBy,
      updatedBy: doc.metadata?.updatedBy,
      createdAt: doc.metadata?.createdAt,
      updatedAt: doc.metadata?.updatedAt,
    };
  }
}
