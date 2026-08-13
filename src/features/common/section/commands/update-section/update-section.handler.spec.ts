import { UpdateSectionHandler } from "@/features/common/section/commands/update-section/update-section.handler";
import { UpdateSectionCommand } from "@/features/common/section/commands/update-section/update-section.command";
import { UpdateSectionRequest } from "@/features/common/section/commands/update-section/update-section.request";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("UpdateSectionHandler", () => {
  let handler: UpdateSectionHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeSection = (overrides: Partial<CourseSection> = {}) =>
    ({
      id: 1,
      courseId: 5,
      title: "Old title",
      order: 1,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as CourseSection;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateSectionHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("only changes fields that were provided, leaving undefined fields alone", async () => {
    const section = makeSection();
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue(section);

    const payload = { title: "New title" } as UpdateSectionRequest;

    await handler.execute(new UpdateSectionCommand(1, payload));

    expect(section.title).toBe("New title");
    // untouched field
    expect(section.order).toBe(1);
  });

  it("applies order: 0 explicitly (undefined-check, not falsy-check)", async () => {
    const section = makeSection({ order: 3 });
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue(section);

    const payload = { order: 0 } as UpdateSectionRequest;

    await handler.execute(new UpdateSectionCommand(1, payload));

    expect(section.order).toBe(0);
  });

  it("invalidates the sections list, section-by-id and course-by-id caches on success", async () => {
    const section = makeSection({ courseId: 5 });
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue(section);

    await handler.execute(new UpdateSectionCommand(1, { title: "New" } as UpdateSectionRequest));

    expect(cache.del).toHaveBeenCalledWith("sections:course:5");
    expect(cache.del).toHaveBeenCalledWith("sections:1");
    expect(cache.del).toHaveBeenCalledWith("courses:5");
  });

  it("throws DoesNotExistException (404) when the section doesn't exist", async () => {
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateSectionCommand(999, {} as UpdateSectionRequest)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(cache.del).not.toHaveBeenCalled();
  });
});
