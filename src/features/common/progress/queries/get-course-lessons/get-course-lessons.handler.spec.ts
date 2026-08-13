import { GetCourseLessonsHandler } from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.handler";
import { GetCourseLessonsQuery } from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.query";
import { Course } from "@/features/common/entities/course/course.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { LessonProgress } from "@/features/common/entities/progress/lesson-progress.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { PurchaseStatus } from "@/core/enums/purchase-status.enum";

describe("GetCourseLessonsHandler", () => {
  let handler: GetCourseLessonsHandler;

  beforeEach(() => {
    handler = new GetCourseLessonsHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(null);
    const purchaseSpy = jest.spyOn(CoursePurchase, "findOneBy");

    await expect(
      handler.execute(new GetCourseLessonsQuery(1, 9)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(purchaseSpy).not.toHaveBeenCalled();
  });

  it("locks non-free lessons and strips their video when the course isn't purchased, while free lessons stay unlocked", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          title: "Section A",
          order: 1,
          lessons: [
            { id: 100, title: "Free lesson", order: 1, isFree: true, video: "free.mp4" },
            { id: 101, title: "Paid lesson", order: 2, isFree: false, video: "paid.mp4" },
          ],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
    jest.spyOn(LessonProgress, "findBy").mockResolvedValue([]);

    const result = await handler.execute(new GetCourseLessonsQuery(1, 9));

    const [freeLesson, paidLesson] = result.sections[0].lessons;
    expect(freeLesson.locked).toBe(false);
    expect(freeLesson.video).toBe("free.mp4");
    expect(paidLesson.locked).toBe(true);
    expect(paidLesson.video).toBeNull();
  });

  it("unlocks every lesson (including non-free ones) once the course is purchased", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          title: "Section A",
          order: 1,
          lessons: [
            { id: 100, title: "Free lesson", order: 1, isFree: true, video: "free.mp4" },
            { id: 101, title: "Paid lesson", order: 2, isFree: false, video: "paid.mp4" },
          ],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue({
      id: 5,
      courseId: 1,
      userId: 9,
      status: PurchaseStatus.Success,
    } as any);
    jest.spyOn(LessonProgress, "findBy").mockResolvedValue([]);

    const result = await handler.execute(new GetCourseLessonsQuery(1, 9));

    const [freeLesson, paidLesson] = result.sections[0].lessons;
    expect(freeLesson.locked).toBe(false);
    expect(paidLesson.locked).toBe(false);
    expect(paidLesson.video).toBe("paid.mp4");
  });

  it("marks a lesson completed only when a matching LessonProgress row exists for that user", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          title: "Section A",
          order: 1,
          lessons: [
            { id: 100, title: "Lesson A", order: 1, isFree: true, video: "a.mp4" },
            { id: 101, title: "Lesson B", order: 2, isFree: true, video: "b.mp4" },
          ],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
    jest
      .spyOn(LessonProgress, "findBy")
      .mockResolvedValue([{ id: 1, lessonId: 100, userId: 9 }] as any);

    const result = await handler.execute(new GetCourseLessonsQuery(1, 9));

    const [lessonA, lessonB] = result.sections[0].lessons;
    expect(lessonA.completed).toBe(true);
    expect(lessonB.completed).toBe(false);
  });

  it("sorts sections and lessons by their order field", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 20,
          title: "Section B",
          order: 2,
          lessons: [
            { id: 201, title: "B-Lesson 2", order: 2, isFree: true, video: null },
            { id: 200, title: "B-Lesson 1", order: 1, isFree: true, video: null },
          ],
        },
        {
          id: 10,
          title: "Section A",
          order: 1,
          lessons: [],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
    jest.spyOn(LessonProgress, "findBy").mockResolvedValue([]);

    const result = await handler.execute(new GetCourseLessonsQuery(1, 9));

    expect(result.sections.map((s: any) => s.id)).toEqual([10, 20]);
    expect(result.sections[1].lessons.map((l: any) => l.id)).toEqual([200, 201]);
  });

  it("skips the LessonProgress lookup when the course has no lessons", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
    const progressSpy = jest.spyOn(LessonProgress, "findBy");

    const result = await handler.execute(new GetCourseLessonsQuery(1, 9));

    expect(progressSpy).not.toHaveBeenCalled();
    expect(result.sections).toEqual([]);
  });
});
