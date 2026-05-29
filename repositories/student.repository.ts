import { BaseRepository } from "./base.repository";
import { Student } from "@/types/student";

export class StudentRepository extends BaseRepository<Student> {
constructor() {
super("students");
}

async findByRollNumber(
rollNumber: number,
tenantId: string
): Promise<Student | null> {
const snapshot = await this.db
.collection(this.collectionName)
.where("tenantId", "==", tenantId)
.where("rollNumber", "==", rollNumber)
.limit(1)
.get();

```
if (snapshot.empty) {
  return null;
}

const doc = snapshot.docs[0];

return {
  id: doc.id,
  ...doc.data(),
} as Student;
```

}

async findByClass(
className: string,
tenantId: string
): Promise<Student[]> {
const snapshot = await this.db
.collection(this.collectionName)
.where("tenantId", "==", tenantId)
.where("classGrade", "==", className)
.orderBy("rollNumber", "asc")
.get();

```
return snapshot.docs.map(
  (doc) =>
    ({
      id: doc.id,
      ...doc.data(),
    }) as Student
);
```

}

async findBySection(
className: string,
section: string,
tenantId: string
): Promise<Student[]> {
const snapshot = await this.db
.collection(this.collectionName)
.where("tenantId", "==", tenantId)
.where("classGrade", "==", className)
.where("section", "==", section)
.orderBy("rollNumber", "asc")
.get();

```
return snapshot.docs.map(
  (doc) =>
    ({
      id: doc.id,
      ...doc.data(),
    }) as Student
);
```

}
}
