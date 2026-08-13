import { CreateCourseHandler } from "@/features/common/courses/commands/create-course/create-course.handler";
import { CreateCourseCommand } from "@/features/common/courses/commands/create-course/create-course.command";
import { CreateCourseRequest } from "@/features/common/courses/commands/create-course/create-course.request";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseAuthor } from "@/features/common/entities/course/course-author.entity";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { COURSES_LIST_CACHE_KEY } from "@/features/common/courses/course.cache";

describe("CreateCourseHandler", () => {
  let handler: CreateCourseHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const basePayload = (overrides: Partial<CreateCourseRequest> = {}) =>
    ({
      title: "Course 1",
      price: 1000,
      description: "desc",
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      authorIds: [11, 12],
      ...overrides,
    }) as CreateCourseRequest;

  const mockAllFksExist = () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(true);
  };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateCourseHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a course, creates courseAuthor rows, and returns authorIds passed through", async () => {
    mockAllFksExist();
    jest.spyOn(Author, "countBy").mockResolvedValue(2);
    const createSpy = jest.spyOn(Course, "create").mockReturnValue({ id: 5 } as any);
    jest.spyOn(Course, "save").mockResolvedValue({ id: 5 } as any);
    const courseAuthorCreateSpy = jest
      .spyOn(CourseAuthor, "create")
      .mockImplementation((v: any) => v);
    const courseAuthorSaveSpy = jest.spyOn(CourseAuthor, "save").mockResolvedValue([] as any);

    const result = await handler.execute(
      new CreateCourseCommand(basePayload(), "covers/c1.png"),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Course 1",
        price: 1000,
        discountPrice: null,
        cover: "covers/c1.png",
        description: "desc",
        categoryId: 1,
        difficultyId: 1,
        languageId: 1,
      }),
    );
    expect(courseAuthorCreateSpy).toHaveBeenCalledWith({ courseId: 5, authorId: 11 });
    expect(courseAuthorCreateSpy).toHaveBeenCalledWith({ courseId: 5, authorId: 12 });
    expect(courseAuthorSaveSpy).toHaveBeenCalled();
    expect(result.authorIds).toEqual([11, 12]);
  });

  it("passes discountPrice through when provided", async () => {
    mockAllFksExist();
    jest.spyOn(Author, "countBy").mockResolvedValue(2);
    const createSpy = jest.spyOn(Course, "create").mockReturnValue({ id: 5 } as any);
    jest.spyOn(Course, "save").mockResolvedValue({ id: 5 } as any);
    jest.spyOn(CourseAuthor, "create").mockImplementation((v: any) => v);
    jest.spyOn(CourseAuthor, "save").mockResolvedValue([] as any);

    await handler.execute(
      new CreateCourseCommand(basePayload({ discountPrice: 500 }), "covers/c1.png"),
    );

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ discountPrice: 500 }));
  });

  it("invalidates the courses list cache on success", async () => {
    mockAllFksExist();
    jest.spyOn(Author, "countBy").mockResolvedValue(2);
    jest.spyOn(Course, "create").mockReturnValue({ id: 5 } as any);
    jest.spyOn(Course, "save").mockResolvedValue({ id: 5 } as any);
    jest.spyOn(CourseAuthor, "create").mockImplementation((v: any) => v);
    jest.spyOn(CourseAuthor, "save").mockResolvedValue([] as any);

    await handler.execute(new CreateCourseCommand(basePayload(), "covers/c1.png"));

    expect(cache.del).toHaveBeenCalledWith(COURSES_LIST_CACHE_KEY);
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(false);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(Course, "create");

    await expect(
      handler.execute(new CreateCourseCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the difficulty doesn't exist", async () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);
    jest.spyOn(Language, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(Course, "create");

    await expect(
      handler.execute(new CreateCourseCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the language doesn't exist", async () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);
    const createSpy = jest.spyOn(Course, "create");

    await expect(
      handler.execute(new CreateCourseCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when one or more authors don't exist", async () => {
    mockAllFksExist();
    jest.spyOn(Author, "countBy").mockResolvedValue(1); // only 1 of 2 found
    const createSpy = jest.spyOn(Course, "create");

    await expect(
      handler.execute(new CreateCourseCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
  });
});
