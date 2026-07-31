import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerStorageOptions } from "@/core/configs/multer/multer.config";

export const LESSON_FILES_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ],
  {
    storage: multerStorageOptions({
      destination: "lessons",
      extensions: ["mp4", "webm", "mov", "jpg", "jpeg", "png"],
    }),
    limits: {
      fileSize: 1024 * 1024 * 200,
      files: 2,
    },
  },
);

export type LessonFiles = {
  video?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
};
