import { GetAuthorsHandler } from "@/features/library/author/queries/get-authors/get-authors.handler";
import { GetAuthorsQuery } from "@/features/library/author/queries/get-authors/get-authors.query";
import { GetAuthorsRequest } from "@/features/library/author/queries/get-authors/get-authors.request";
import { Author } from "@/features/library/entities/author/author.entity";
import { AUTHORS_LIST_CACHE_KEY } from "@/features/library/author/author.cache";

describe("GetAuthorsHandler", () => {
  let handler: GetAuthorsHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetAuthorsHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns authors and caches the result on a cache miss when there's no search term", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Author, "find")
      .mockResolvedValue([{ id: 1, fullName: "Jane Doe" }] as any);

    const result = await handler.execute(new GetAuthorsQuery({} as GetAuthorsRequest));

    expect(findSpy).toHaveBeenCalledWith({ where: {} });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith(AUTHORS_LIST_CACHE_KEY, result);
  });

  it("returns the cached list and skips the DB query when present", async () => {
    const cached = [{ id: 1, fullName: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Author, "find");

    const result = await handler.execute(new GetAuthorsQuery({} as GetAuthorsRequest));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("bypasses the cache entirely when a search term is provided", async () => {
    const findSpy = jest.spyOn(Author, "find").mockResolvedValue([] as any);

    await handler.execute(new GetAuthorsQuery({ search: "jane" } as GetAuthorsRequest));

    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalledWith({
      where: { fullName: expect.anything() },
    });
  });
});
