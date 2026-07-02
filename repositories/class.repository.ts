// repositories/class.repository.ts
import apiClient from "@/lib/api/client";

export class ClassRepository {
  async getAll() {
    return apiClient.get("/classes");
  }

  async create(data: { classGrade: string; sectionName: string }) {
    return apiClient.post("/classes", data);
  }

  async delete(id: string) {
    return apiClient.delete(`/classes?id=${id}`);
  }
}

export const classRepository = new ClassRepository();
