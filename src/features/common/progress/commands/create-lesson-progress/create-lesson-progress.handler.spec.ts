import { ForbiddenException } from "@nestjs/common";
import { CreateLessonProgressHandler } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.handler";
import { CreateLessonProgressCommand } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.command";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { LessonProgress } from "@/features/common/entities/progress/lesson-progress.entity";
import { Certificate } from "@/features/common/entities/certificate/certificate.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { PurchaseStatus } from "@/core/enums/purchase-status/purchase-status.enum";

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
    jest.spyOn(Course, "findOne").mockResolvedValue(null);

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
    jest.spyOn(Course, "findOne").mockResolvedValue(null);

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
    jest.spyOn(Course, "findOne").mockResolvedValue(null);

    const result = await handler.execute(new CreateLessonProgressCommand(9, 1));

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.id).toBe(55);
    expect(result.lessonId).toBe(1);
    expect(result.userId).toBe(9);
  });

  describe("certificate issuance side effect", () => {
    const course = (overrides: Partial<any> = {}) => ({
      id: 5,
      price: 0,
      sections: [{ id: 1, lessons: [{ id: 1 }, { id: 2 }] }],
      ...overrides,
    });

    const completeLesson = async () => {
      jest.spyOn(CourseLesson, "findOne").mockResolvedValue({
        id: 2,
        isFree: true,
        section: { id: 1, courseId: 5 },
      } as any);
      jest.spyOn(LessonProgress, "findOneBy").mockResolvedValue(null);
      jest.spyOn(LessonProgress, "create").mockReturnValue({
        lessonId: 2,
        userId: 9,
      } as any);
      jest
        .spyOn(LessonProgress, "save")
        .mockResolvedValue({ id: 100, lessonId: 2, userId: 9 } as any);

      return handler.execute(new CreateLessonProgressCommand(9, 2));
    };

    it("issues a certificate once every lesson in a free course is completed", async () => {
      jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
      jest.spyOn(LessonProgress, "countBy").mockResolvedValue(2);
      jest.spyOn(Certificate, "findOneBy").mockResolvedValue(null);
      const createSpy = jest
        .spyOn(Certificate, "create")
        .mockReturnValue({} as any);
      const saveSpy = jest.spyOn(Certificate, "save").mockResolvedValue({} as any);

      await completeLesson();

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 5, userId: 9 }),
      );
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it("does not issue a certificate when lessons remain incomplete", async () => {
      jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
      jest.spyOn(LessonProgress, "countBy").mockResolvedValue(1);
      const purchaseSpy = jest.spyOn(CoursePurchase, "findOneBy");
      const createSpy = jest.spyOn(Certificate, "create");

      await completeLesson();

      expect(purchaseSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("does not issue a certificate for a completed paid course that was never purchased", async () => {
      jest.spyOn(Course, "findOne").mockResolvedValue(course({ price: 10 }) as any);
      jest.spyOn(LessonProgress, "countBy").mockResolvedValue(2);
      jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
      const createSpy = jest.spyOn(Certificate, "create");

      await completeLesson();

      expect(createSpy).not.toHaveBeenCalled();
    });

    it("issues a certificate for a completed, purchased paid course", async () => {
      jest.spyOn(Course, "findOne").mockResolvedValue(course({ price: 10 }) as any);
      jest.spyOn(LessonProgress, "countBy").mockResolvedValue(2);
      jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue({
        status: PurchaseStatus.Success,
      } as any);
      jest.spyOn(Certificate, "findOneBy").mockResolvedValue(null);
      const createSpy = jest
        .spyOn(Certificate, "create")
        .mockReturnValue({} as any);
      jest.spyOn(Certificate, "save").mockResolvedValue({} as any);

      await completeLesson();

      expect(createSpy).toHaveBeenCalled();
    });

    it("does not create a second certificate if one already exists", async () => {
      jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
      jest.spyOn(LessonProgress, "countBy").mockResolvedValue(2);
      jest
        .spyOn(Certificate, "findOneBy")
        .mockResolvedValue({ id: 1, courseId: 5, userId: 9 } as any);
      const createSpy = jest.spyOn(Certificate, "create");

      await completeLesson();

      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
