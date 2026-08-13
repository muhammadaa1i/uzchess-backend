import { UpdateAuthorHandler } from "@/features/library/author/commands/update-author/update-author.handler";
import { UpdateAuthorCommand } from "@/features/library/author/commands/update-author/update-author.command";
import { UpdateAuthorRequest } from "@/features/library/author/commands/update-author/update-author.request";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AUTHORS_LIST_CACHE_KEY, authorByIdCacheKey } from "@/features/library/author/author.cache";

describe("UpdateAuthorHandler", () => {
  let handler: UpdateAuthorHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateAuthorHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates the author's fullName when found", async () => {
    const author = { id: 1, fullName: "Old Name", save: jest.fn() };
    author.save.mockResolvedValue({ id: 1, fullName: "New Name" });
    jest.spyOn(Author, "findOneBy").mockResolvedValue(author as any);

    const result = await handler.execute(
      new UpdateAuthorCommand(1, { fullName: "New Name" } as UpdateAuthorRequest),
    );

    expect(author.fullName).toBe("New Name");
    expect(author.save).toHaveBeenCalled();
    expect(result.fullName).toBe("New Name");
  });

  it("invalidates the authors list and by-id caches on success", async () => {
    const author = { id: 1, fullName: "Old Name", save: jest.fn().mockResolvedValue({ id: 1, fullName: "New Name" }) };
    jest.spyOn(Author, "findOneBy").mockResolvedValue(author as any);

    await handler.execute(new UpdateAuthorCommand(1, { fullName: "New Name" } as UpdateAuthorRequest));

    expect(cache.del).toHaveBeenCalledWith(AUTHORS_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(authorByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the author doesn't exist", async () => {
    jest.spyOn(Author, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateAuthorCommand(999, { fullName: "New Name" } as UpdateAuthorRequest)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(cache.del).not.toHaveBeenCalled();
  });
});
