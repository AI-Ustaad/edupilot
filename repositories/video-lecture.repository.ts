import { BaseRepository } from "./base.repository";
import { VideoLecture } from "@/types/video-lecture";
import type { IVideoLectureRepository } from "@/interfaces/IVideoLectureRepository";

export class VideoLectureRepository extends BaseRepository<VideoLecture> implements IVideoLectureRepository {
  constructor() {
    super("videoLectures");
  }
}
