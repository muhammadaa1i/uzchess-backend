import { GetNextLessonHandler } from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.handler";
import { GetNextLessonQuery } from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.query";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { PurchaseStatus } from "@/core/enums/purchase-status.enum";

describe("GetNextLessonHandler", () => {
  let handler: GetNextLessonHandler;

  beforeEach(() => {
    handler = new GetNextLessonHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the current lesson doesn't exist", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue(null);
    const courseSpy = jest.spyOn(Course, "findOne");

    await expect(
      handler.execute(new GetNextLessonQuery(999, 9)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(courseSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the lesson's course can't be found", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 100,
      section: { id: 10, courseId: 1 },
    } as any);
    jest.spyOn(Course, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetNextLessonQuery(100, 9)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("walks the ordered lesson chain across sections and returns the next lesson", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 100,
      section: { id: 10, courseId: 1 },
    } as any);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          order: 1,
          lessons: [
            { id: 100, order: 1, isFree: true, video: "v100.mp4" },
            { id: 101, order: 2, isFree: true, video: "v101.mp4" },
          ],
        },
        {
          id: 20,
          order: 2,
          lessons: [{ id: 200, order: 1, isFree: true, video: "v200.mp4" }],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);

    const result = await handler.execute(new GetNextLessonQuery(100, 9));

    expect(result.hasNext).toBe(true);
    expect(result.lessonId).toBe(101);
    expect(result.locked).toBe(false);
    expect(result.video).toBe("v101.mp4");
  });

  it("crosses into the next section once the current section's lessons are exhausted", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 101,
      section: { id: 10, courseId: 1 },
    } as any);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          order: 1,
          lessons: [
            { id: 100, order: 1, isFree: true, video: "v100.mp4" },
            { id: 101, order: 2, isFree: true, video: "v101.mp4" },
          ],
        },
        {
          id: 20,
          order: 2,
          lessons: [{ id: 200, order: 1, isFree: true, video: "v200.mp4" }],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);

    const result = await handler.execute(new GetNextLessonQuery(101, 9));

    expect(result.hasNext).toBe(true);
    expect(result.lessonId).toBe(200);
  });

  it("locks the next lesson (and hides its video) when it's not free and the course isn't purchased", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 100,
      section: { id: 10, courseId: 1 },
    } as any);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          order: 1,
          lessons: [
            { id: 100, order: 1, isFree: true, video: "v100.mp4" },
            { id: 101, order: 2, isFree: false, video: "v101.mp4" },
          ],
        },
      ],
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);

    const result = await handler.execute(new GetNextLessonQuery(100, 9));

    expect(result.hasNext).toBe(true);
    expect(result.lessonId).toBe(101);
    expect(result.locked).toBe(true);
    expect(result.video).toBeNull();
  });

  it("unlocks a non-free next lesson when the course was purchased", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 100,
      section: { id: 10, courseId: 1 },
    } as any);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          order: 1,
          lessons: [
            { id: 100, order: 1, isFree: true, video: "v100.mp4" },
            { id: 101, order: 2, isFree: false, video: "v101.mp4" },
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

    const result = await handler.execute(new GetNextLessonQuery(100, 9));

    expect(result.hasNext).toBe(true);
    expect(result.locked).toBe(false);
    expect(result.video).toBe("v101.mp4");
  });

  it("returns hasNext:false with null fields, without checking purchase status, when the current lesson is the last one", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 200,
      section: { id: 20, courseId: 1 },
    } as any);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      id: 1,
      sections: [
        {
          id: 10,
          order: 1,
          lessons: [{ id: 100, order: 1, isFree: true, video: "v100.mp4" }],
        },
        {
          id: 20,
          order: 2,
          lessons: [{ id: 200, order: 1, isFree: true, video: "v200.mp4" }],
        },
      ],
    } as any);
    const purchaseSpy = jest.spyOn(CoursePurchase, "findOneBy");

    const result = await handler.execute(new GetNextLessonQuery(200, 9));

    expect(result.hasNext).toBe(false);
    expect(result.lessonId).toBeNull();
    expect(result.locked).toBeNull();
    expect(result.video).toBeNull();
    expect(purchaseSpy).not.toHaveBeenCalled();
  });
});
