jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateCourseHandler } from "@/features/common/courses/commands/update-course/update-course.handler";
import { UpdateCourseCommand } from "@/features/common/courses/commands/update-course/update-course.command";
import { UpdateCourseRequest } from "@/features/common/courses/commands/update-course/update-course.request";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseAuthor } from "@/features/common/entities/course/course-author.entity";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

describe("UpdateCourseHandler", () => {
  let handler: UpdateCourseHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeCourse = (overrides: Partial<Course> = {}) =>
    ({
      id: 1,
      title: "Old title",
      price: 1000,
      discountPrice: 200,
      cover: "old-cover.png",
      description: "Old description",
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as Course;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateCourseHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("only changes fields that were provided, leaving undefined fields alone", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([{ authorId: 11 }, { authorId: 12 }] as any);

    const payload = { title: "New title" } as UpdateCourseRequest;

    const result = await handler.execute(new UpdateCourseCommand(1, payload, undefined));

    expect(course.title).toBe("New title");
    // untouched fields
    expect(course.price).toBe(1000);
    expect(course.discountPrice).toBe(200);
    expect(course.categoryId).toBe(1);
    expect(course.difficultyId).toBe(1);
    expect(course.languageId).toBe(1);
    expect(course.cover).toBe("old-cover.png");
    expect(result.authorIds).toEqual([11, 12]);
  });

  it("applies discountPrice: null explicitly (undefined-check, not falsy-check regression)", async () => {
    const course = makeCourse({ discountPrice: 500 });
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([]);

    const payload = { discountPrice: null } as unknown as UpdateCourseRequest;

    await handler.execute(new UpdateCourseCommand(1, payload, undefined));

    expect(course.discountPrice).toBeNull();
  });

  it("applies discountPrice: 0 explicitly (undefined-check, not falsy-check regression)", async () => {
    const course = makeCourse({ discountPrice: 500 });
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([]);

    const payload = { discountPrice: 0 } as UpdateCourseRequest;

    await handler.execute(new UpdateCourseCommand(1, payload, undefined));

    expect(course.discountPrice).toBe(0);
  });

  it("validates and swaps categoryId when provided", async () => {
    const course = makeCourse({ categoryId: 1 });
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    const categoryExistsSpy = jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(
      new UpdateCourseCommand(1, { categoryId: 9 } as UpdateCourseRequest, undefined),
    );

    expect(categoryExistsSpy).toHaveBeenCalledWith({ id: 9 });
    expect(course.categoryId).toBe(9);
  });

  it("throws DoesNotExistException (404) when the new categoryId doesn't exist", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(false);

    await expect(
      handler.execute(
        new UpdateCourseCommand(1, { categoryId: 999 } as UpdateCourseRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(course.categoryId).toBe(1);
  });

  it("throws DoesNotExistException (404) when the new difficultyId doesn't exist", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);

    await expect(
      handler.execute(
        new UpdateCourseCommand(1, { difficultyId: 999 } as UpdateCourseRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (404) when the new languageId doesn't exist", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);

    await expect(
      handler.execute(
        new UpdateCourseCommand(1, { languageId: 999 } as UpdateCourseRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("replaces the cover and deletes the old one from storage", async () => {
    const course = makeCourse({ cover: "old-cover.png" });
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(
      new UpdateCourseCommand(1, {} as UpdateCourseRequest, "new-cover.png"),
    );

    expect(course.cover).toBe("new-cover.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-cover.png");
  });

  it("does not touch the cover when no new file is provided", async () => {
    const course = makeCourse({ cover: "old-cover.png" });
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(new UpdateCourseCommand(1, {} as UpdateCourseRequest, undefined));

    expect(course.cover).toBe("old-cover.png");
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("replaces courseAuthors when authorIds are provided, validating them first", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    const authorCountSpy = jest.spyOn(Author, "countBy").mockResolvedValue(2);
    const deleteSpy = jest.spyOn(CourseAuthor, "delete").mockResolvedValue({} as any);
    const createSpy = jest.spyOn(CourseAuthor, "create").mockImplementation((v: any) => v);
    const saveSpy = jest.spyOn(CourseAuthor, "save").mockResolvedValue([] as any);

    const result = await handler.execute(
      new UpdateCourseCommand(1, { authorIds: [21, 22] } as UpdateCourseRequest, undefined),
    );

    expect(authorCountSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith({ courseId: 1 });
    expect(createSpy).toHaveBeenCalledWith({ courseId: 1, authorId: 21 });
    expect(createSpy).toHaveBeenCalledWith({ courseId: 1, authorId: 22 });
    expect(saveSpy).toHaveBeenCalled();
    expect(result.authorIds).toEqual([21, 22]);
  });

  it("throws DoesNotExistException (404) when replacement authorIds don't all exist", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(Author, "countBy").mockResolvedValue(1);
    const deleteSpy = jest.spyOn(CourseAuthor, "delete");

    await expect(
      handler.execute(
        new UpdateCourseCommand(1, { authorIds: [21, 22] } as UpdateCourseRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("invalidates courses list and course-by-id caches on success", async () => {
    const course = makeCourse();
    jest.spyOn(Course, "findOneBy").mockResolvedValue(course);
    jest.spyOn(CourseAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(new UpdateCourseCommand(1, {} as UpdateCourseRequest, undefined));

    expect(cache.del).toHaveBeenCalledWith(COURSES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(courseByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateCourseCommand(999, {} as UpdateCourseRequest, undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
