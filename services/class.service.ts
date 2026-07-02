// services/class.service.ts
import { classRepository } from "@/repositories/class.repository";
import { safeArray } from "@/lib/api/safeResponse";

export class ClassService {
  async getAllClasses() {
    const response = await classRepository.getAll();
    return safeArray(response); // Business Rule: ہمیشہ Array Return کرنا ہے
  }

  async createClass(data: { classGrade: string; sectionName: string }) {
    return classRepository.create(data);
  }

  async deleteClass(id: string) {
    return classRepository.delete(id);
  }
}

export const classService = new ClassService();
