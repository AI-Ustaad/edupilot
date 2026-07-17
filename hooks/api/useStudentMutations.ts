import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useRuntimeStore } from "@/lib/store/runtime.store";
import { StudentEntity } from "@/entities/student.entity";
import toast from "react-hot-toast";

export const useStudentMutations = () => {
  // Access the hydrate function to inject new data into the Kernel
  const hydrateStudents = useRuntimeStore((state) => state.hydrateStudents);
  const studentsById = useRuntimeStore((state) => state.studentsById);

  // 🟢 Create Student Mutation
  const createStudent = useMutation({
    mutationFn: async (newStudentData: Partial<StudentEntity>) => {
      const res = await apiClient.post("/students", newStudentData);
      return res.data?.student as StudentEntity;
    },
    onSuccess: (newStudent) => {
      // 🚀 Enterprise Rule 4: Instant Kernel Injection
      // نیا اسٹوڈنٹ بنتے ہی پرانے ڈیٹا کے ساتھ ملا کر Kernel کو اپڈیٹ کر دیں
      const currentStudents = Object.values(studentsById);
      hydrateStudents([...currentStudents, newStudent]);
      
      toast.success("Student successfully onboarded!");
    },
    onError: () => {
      toast.error("Failed to enroll student.");
    }
  });

  return {
    createStudent: createStudent.mutateAsync,
    isCreating: createStudent.isPending,
  };
};
