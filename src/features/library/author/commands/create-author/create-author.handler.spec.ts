import { CreateAuthorHandler } from "@/features/library/author/commands/create-author/create-author.handler";
import { CreateAuthorCommand } from "@/features/library/author/commands/create-author/create-author.command";
import { CreateAuthorRequest } from "@/features/library/author/commands/create-author/create-author.request";
import { Author } from "@/features/library/entities/author/author.entity";
import { AUTHORS_LIST_CACHE_KEY } from "@/features/library/author/author.cache";

describe("CreateAuthorHandler", () => {
  let handler: CreateAuthorHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateAuthorHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates an author (no uniqueness check) and returns the response DTO", async () => {
    const createSpy = jest.spyOn(Author, "create").mockReturnValue({ fullName: "Jane Doe" } as any);
    const saveSpy = jest
      .spyOn(Author, "save")
      .mockResolvedValue({ id: 1, fullName: "Jane Doe" } as any);

    const result = await handler.execute(
      new CreateAuthorCommand({ fullName: "Jane Doe" } as CreateAuthorRequest),
    );

    expect(createSpy).toHaveBeenCalledWith({ fullName: "Jane Doe" });
    expect(saveSpy).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.fullName).toBe("Jane Doe");
  });

  it("invalidates the authors list cache on success", async () => {
    jest.spyOn(Author, "create").mockReturnValue({} as any);
    jest.spyOn(Author, "save").mockResolvedValue({ id: 1, fullName: "Jane Doe" } as any);

    await handler.execute(new CreateAuthorCommand({ fullName: "Jane Doe" } as CreateAuthorRequest));

    expect(cache.del).toHaveBeenCalledWith(AUTHORS_LIST_CACHE_KEY);
  });
});
