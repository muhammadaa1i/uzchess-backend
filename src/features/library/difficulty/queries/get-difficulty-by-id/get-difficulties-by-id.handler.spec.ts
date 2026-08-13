import { GetDifficultiesByIdHandler } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.handler";
import { GetDifficultiesByIdQuery } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.query";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { difficultyByIdCacheKey } from "@/features/library/difficulty/difficulty.cache";

describe("GetDifficultiesByIdHandler", () => {
  let handler: GetDifficultiesByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetDifficultiesByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the difficulty and caches the result on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Difficulty, "findOneBy")
      .mockResolvedValue({ id: 1, degree: "Beginner", icon: "icon.png" } as any);

    const result = await handler.execute(new GetDifficultiesByIdQuery(1));

    expect(findSpy).toHaveBeenCalledWith({ id: 1 });
    expect(result.degree).toBe("Beginner");
    expect(cache.set).toHaveBeenCalledWith(difficultyByIdCacheKey(1), result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, degree: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Difficulty, "findOneBy");

    const result = await handler.execute(new GetDifficultiesByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the difficulty doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetDifficultiesByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
