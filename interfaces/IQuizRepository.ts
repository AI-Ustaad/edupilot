// interfaces/IQuizRepository.ts
export interface IQuizRepository {
  bulkCreate(...args: any[]): Promise<any>;
  count(...args: any[]): Promise<any>;
  create(...args: any[]): Promise<any>;
  createSubmission(...args: any[]): Promise<any>;
  delete(...args: any[]): Promise<any>;
  exists(...args: any[]): Promise<any>;
  findAll(...args: any[]): Promise<any>;
  findById(...args: any[]): Promise<any>;
  findSubmissionsByQuiz(...args: any[]): Promise<any>;
  paginate(...args: any[]): Promise<any>;
  softDelete(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
