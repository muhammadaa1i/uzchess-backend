import { DeleteAuthorHandler } from "@/features/library/author/commands/delete-author/delete-author.handler";
import { DeleteAuthorCommand } from "@/features/library/author/commands/delete-author/delete-author.command";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AUTHORS_LIST_CACHE_KEY, authorByIdCacheKey } from "@/features/library/author/author.cache";

describe("DeleteAuthorHandler", () => {
  let handler: DeleteAuthorHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteAuthorHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the author with no FK-in-use pre-check (cascades via BookAuthor's onDelete: CASCADE)", async () => {
    const author = { id: 1, fullName: "Jane Doe" };
    jest.spyOn(Author, "findOneBy").mockResolvedValue(author as any);
    const removeSpy = jest.spyOn(Author, "remove").mockResolvedValue(author as any);

    const result = await handler.execute(new DeleteAuthorCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(author);
    expect(result.message).toBe("Author deleted successfully");
  });

  it("invalidates the authors list and by-id caches on success", async () => {
    const author = { id: 1, fullName: "Jane Doe" };
    jest.spyOn(Author, "findOneBy").mockResolvedValue(author as any);
    jest.spyOn(Author, "remove").mockResolvedValue(author as any);

    await handler.execute(new DeleteAuthorCommand(1));

    expect(cache.del).toHaveBeenCalledWith(AUTHORS_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(authorByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the author doesn't exist", async () => {
    jest.spyOn(Author, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Author, "remove");

    await expect(handler.execute(new DeleteAuthorCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
