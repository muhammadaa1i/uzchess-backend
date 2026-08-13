import { GetAuthorsByIdHandler } from "@/features/library/author/queries/get-authors-by-id/get-authors-by-id.handler";
import { GetAuthorsByIdQuery } from "@/features/library/author/queries/get-authors-by-id/get-authors-by-id.query";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { authorByIdCacheKey } from "@/features/library/author/author.cache";

describe("GetAuthorsByIdHandler", () => {
  let handler: GetAuthorsByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetAuthorsByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the author and caches the result on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Author, "findOneBy")
      .mockResolvedValue({ id: 1, fullName: "Jane Doe" } as any);

    const result = await handler.execute(new GetAuthorsByIdQuery(1));

    expect(findSpy).toHaveBeenCalledWith({ id: 1 });
    expect(result.fullName).toBe("Jane Doe");
    expect(cache.set).toHaveBeenCalledWith(authorByIdCacheKey(1), result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, fullName: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Author, "findOneBy");

    const result = await handler.execute(new GetAuthorsByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the author doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Author, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetAuthorsByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
