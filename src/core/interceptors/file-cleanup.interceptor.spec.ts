import { CallHandler, ExecutionContext } from "@nestjs/common";
import { firstValueFrom, of, throwError } from "rxjs";
import { FileCleanupInterceptor } from "@/core/interceptors/file-cleanup.interceptor";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

// file-cleanup.interceptor.ts imports deleteUploadedFile from multer.config, which
// transitively imports r2.config.ts (throws at module-evaluation time without R2 env
// vars). Mock the whole module so the spec doesn't need real R2 env vars.
jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn(),
}));

describe("FileCleanupInterceptor", () => {
  let interceptor: FileCleanupInterceptor;
  const deleteUploadedFileMock = deleteUploadedFile as jest.Mock;

  const buildContext = (request: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  const buildNext = (handle: () => any): CallHandler => ({
    handle,
  }) as CallHandler;

  beforeEach(() => {
    interceptor = new FileCleanupInterceptor();
    deleteUploadedFileMock.mockReset();
    deleteUploadedFileMock.mockResolvedValue(undefined);
  });

  it("passes the value through unchanged on success, with no cleanup calls at all", async () => {
    const request: any = { file: { path: "https://r2.example.com/avatar/1.png" } };
    const context = buildContext(request);
    const next = buildNext(() => of({ ok: true }));

    const result = await firstValueFrom(interceptor.intercept(context, next) as any);

    expect(result).toEqual({ ok: true });
    expect(deleteUploadedFileMock).not.toHaveBeenCalled();
  });

  it("deletes the single file from request.file (FileInterceptor shape) and re-throws the original error", async () => {
    const request: any = { file: { path: "https://r2.example.com/avatar/1.png" } };
    const context = buildContext(request);
    const originalError = new Error("handler exploded");
    const next = buildNext(() => throwError(() => originalError));

    await expect(
      firstValueFrom(interceptor.intercept(context, next) as any),
    ).rejects.toBe(originalError);

    expect(deleteUploadedFileMock).toHaveBeenCalledTimes(1);
    expect(deleteUploadedFileMock).toHaveBeenCalledWith(
      "https://r2.example.com/avatar/1.png",
    );
  });

  it("deletes every file from request.files as a plain array (FilesInterceptor shape)", async () => {
    const request: any = {
      files: [
        { path: "https://r2.example.com/book/a.png" },
        { path: "https://r2.example.com/book/b.png" },
      ],
    };
    const context = buildContext(request);
    const originalError = new Error("handler exploded");
    const next = buildNext(() => throwError(() => originalError));

    await expect(
      firstValueFrom(interceptor.intercept(context, next) as any),
    ).rejects.toBe(originalError);

    expect(deleteUploadedFileMock).toHaveBeenCalledTimes(2);
    expect(deleteUploadedFileMock).toHaveBeenCalledWith(
      "https://r2.example.com/book/a.png",
    );
    expect(deleteUploadedFileMock).toHaveBeenCalledWith(
      "https://r2.example.com/book/b.png",
    );
  });

  it("deletes every file from request.files as an object of arrays (FileFieldsInterceptor shape, e.g. lesson video+thumbnail)", async () => {
    const request: any = {
      files: {
        video: [{ path: "https://r2.example.com/lesson/video.mp4" }],
        thumbnail: [{ path: "https://r2.example.com/lesson/thumb.png" }],
      },
    };
    const context = buildContext(request);
    const originalError = new Error("handler exploded");
    const next = buildNext(() => throwError(() => originalError));

    await expect(
      firstValueFrom(interceptor.intercept(context, next) as any),
    ).rejects.toBe(originalError);

    expect(deleteUploadedFileMock).toHaveBeenCalledTimes(2);
    expect(deleteUploadedFileMock).toHaveBeenCalledWith(
      "https://r2.example.com/lesson/video.mp4",
    );
    expect(deleteUploadedFileMock).toHaveBeenCalledWith(
      "https://r2.example.com/lesson/thumb.png",
    );
  });

  it("re-throws the original error untouched with zero deleteUploadedFile calls when no files are present at all", async () => {
    const request: any = {};
    const context = buildContext(request);
    const originalError = new Error("handler exploded");
    const next = buildNext(() => throwError(() => originalError));

    await expect(
      firstValueFrom(interceptor.intercept(context, next) as any),
    ).rejects.toBe(originalError);

    expect(deleteUploadedFileMock).not.toHaveBeenCalled();
  });

  it("swallows a deleteUploadedFile rejection: the original error still wins and nothing goes unhandled", async () => {
    deleteUploadedFileMock.mockRejectedValue(new Error("R2 delete failed"));
    const request: any = { file: { path: "https://r2.example.com/avatar/1.png" } };
    const context = buildContext(request);
    const originalError = new Error("handler exploded");
    const next = buildNext(() => throwError(() => originalError));

    await expect(
      firstValueFrom(interceptor.intercept(context, next) as any),
    ).rejects.toBe(originalError);

    expect(deleteUploadedFileMock).toHaveBeenCalledTimes(1);

    // Give the swallowed rejection's microtask a chance to run so an unhandled
    // rejection would surface before the test ends.
    await new Promise((resolve) => setImmediate(resolve));
  });
});
