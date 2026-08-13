import { ForbiddenException } from "@nestjs/common";
import { CreateLessonProgressHandler } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.handler";
import { CreateLessonProgressCommand } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.command";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { LessonProgress } from "@/features/common/entities/progress/lesson-progress.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { PurchaseStatus } from "@/core/enums/purchase-status.enum";

describe("CreateLessonProgressHandler", () => {
  let handler: CreateLessonProgressHandler;

  beforeEach(() => {
    handler = new CreateLessonProgressHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the lesson doesn't exist", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue(null);
    const purchaseSpy = jest.spyOn(CoursePurchase, "findOneBy");
    const progressSpy = jest.spyOn(LessonProgress, "findOneBy");

    await expect(
      handler.execute(new CreateLessonProgressCommand(9, 1)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(purchaseSpy).not.toHaveBeenCalled();
    expect(progressSpy).not.toHaveBeenCalled();
  });

  it("throws ForbiddenException (403) when the lesson isn't free and the course wasn't purchased", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 1,
      isFree: false,
      section: { id: 1, courseId: 5 },
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
    const createSpy = jest.spyOn(LessonProgress, "create");
    const saveSpy = jest.spyOn(LessonProgress, "save");

    await expect(
      handler.execute(new CreateLessonProgressCommand(9, 1)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("allows completing a free lesson even without a purchase", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 1,
      isFree: true,
      section: { id: 1, courseId: 5 },
    } as any);
    const purchaseSpy = jest.spyOn(CoursePurchase, "findOneBy");
    jest.spyOn(LessonProgress, "findOneBy").mockResolvedValue(null);
    jest.spyOn(LessonProgress, "create").mockReturnValue({
      lessonId: 1,
      userId: 9,
    } as any);
    jest
      .spyOn(LessonProgress, "save")
      .mockResolvedValue({ id: 100, lessonId: 1, userId: 9 } as any);

    const result = await handler.execute(new CreateLessonProgressCommand(9, 1));

    // Free lessons never need to check purchase status.
    expect(purchaseSpy).not.toHaveBeenCalled();
    expect(result.lessonId).toBe(1);
    expect(result.userId).toBe(9);
  });

  it("allows completing a non-free lesson when the course was purchased", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 1,
      isFree: false,
      section: { id: 1, courseId: 5 },
    } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue({
      id: 3,
      courseId: 5,
      userId: 9,
      status: PurchaseStatus.Success,
    } as any);
    jest.spyOn(LessonProgress, "findOneBy").mockResolvedValue(null);
    jest.spyOn(LessonProgress, "create").mockReturnValue({
      lessonId: 1,
      userId: 9,
    } as any);
    jest
      .spyOn(LessonProgress, "save")
      .mockResolvedValue({ id: 100, lessonId: 1, userId: 9 } as any);

    const result = await handler.execute(new CreateLessonProgressCommand(9, 1));

    expect(result.lessonId).toBe(1);
    expect(result.userId).toBe(9);
  });

  it("is idempotent: completing an already-completed lesson doesn't error or create a duplicate row", async () => {
    jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
      id: 1,
      isFree: true,
      section: { id: 1, courseId: 5 },
    } as any);
    jest.spyOn(LessonProgress, "findOneBy").mockResolvedValue({
      id: 55,
      lessonId: 1,
      userId: 9,
    } as any);
    const createSpy = jest.spyOn(LessonProgress, "create");
    const saveSpy = jest.spyOn(LessonProgress, "save");

    const result = await handler.execute(new CreateLessonProgressCommand(9, 1));

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.id).toBe(55);
    expect(result.lessonId).toBe(1);
    expect(result.userId).toBe(9);
  });
});
