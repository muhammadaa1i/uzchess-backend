import { GetSectionsByIdHandler } from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.handler";
import { GetSectionsByIdQuery } from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.query";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetSectionsByIdHandler", () => {
  let handler: GetSectionsByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetSectionsByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the section by id and caches the result on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({
      id: 1,
      courseId: 5,
      title: "Section 1",
      order: 1,
    } as any);

    const result = await handler.execute(new GetSectionsByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.title).toBe("Section 1");
    expect(cache.set).toHaveBeenCalledWith("sections:1", result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, title: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(CourseSection, "findOneBy");

    const result = await handler.execute(new GetSectionsByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the section doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetSectionsByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
  });
});
