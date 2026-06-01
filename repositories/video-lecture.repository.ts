import { BaseRepository } from "./base.repository";
import { VideoLecture } from "@/types/video-lecture";

export class VideoLectureRepository extends BaseRepository<VideoLecture> {
  constructor() {
    super("videoLectures");
  }
}
