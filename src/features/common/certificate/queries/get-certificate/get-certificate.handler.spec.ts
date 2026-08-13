import { GetCertificateHandler } from "@/features/common/certificate/queries/get-certificate/get-certificate.handler";
import { GetCertificateQuery } from "@/features/common/certificate/queries/get-certificate/get-certificate.query";
import { Course } from "@/features/common/entities/course/course.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { LessonProgress } from "@/features/common/entities/progress/lesson-progress.entity";
import { Certificate } from "@/features/common/entities/certificate/certificate.entity";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { ForbiddenException } from "@nestjs/common";
import * as pdfGenerator from "@/features/common/certificate/certificate-pdf.generator";

jest.mock("@/features/common/certificate/certificate-pdf.generator", () => ({
  generateCertificatePdf: jest.fn(),
}));

describe("GetCertificateHandler", () => {
  let handler: GetCertificateHandler;

  const course = (overrides: Partial<any> = {}) => ({
    id: 1,
    title: "Chess basics",
    price: 0,
    sections: [
      {
        id: 1,
        lessons: [{ id: 1 }, { id: 2 }],
      },
    ],
    ...overrides,
  });

  const user = { id: 7, firstName: "John", lastName: "Doe" };

  beforeEach(() => {
    handler = new GetCertificateHandler();
    jest
      .spyOn(pdfGenerator, "generateCertificatePdf")
      .mockResolvedValue(Buffer.from("fake-pdf") as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws ForbiddenException (403) when not all lessons are completed", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
    jest.spyOn(LessonProgress, "findBy").mockResolvedValue([{ lessonId: 1 }] as any);

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws ForbiddenException (403) when course is paid and unpurchased", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course({ price: 10 }) as any);
    jest
      .spyOn(LessonProgress, "findBy")
      .mockResolvedValue([{ lessonId: 1 }, { lessonId: 2 }] as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
    jest
      .spyOn(LessonProgress, "findBy")
      .mockResolvedValue([{ lessonId: 1 }, { lessonId: 2 }] as any);
    jest.spyOn(Certificate, "findOneBy").mockResolvedValue(null);
    const createSpy = jest
      .spyOn(Certificate, "create")
      .mockReturnValue({} as any);
    jest.spyOn(Certificate, "save").mockResolvedValue({
      code: "abc-123",
      createdAt: new Date("2026-01-01"),
    } as any);
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).toHaveBeenCalled();
  });

  it("creates exactly one Certificate row when none exists yet, then generates the pdf", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
    jest
      .spyOn(LessonProgress, "findBy")
      .mockResolvedValue([{ lessonId: 1 }, { lessonId: 2 }] as any);
    const findOneBySpy = jest.spyOn(Certificate, "findOneBy").mockResolvedValue(null);
    const createSpy = jest.spyOn(Certificate, "create").mockReturnValue({
      courseId: 1,
      userId: 7,
      code: "new-code",
    } as any);
    const saveSpy = jest.spyOn(Certificate, "save").mockResolvedValue({
      code: "new-code",
      createdAt: new Date("2026-01-01"),
    } as any);
    jest.spyOn(User, "findOneBy").mockResolvedValue(user as any);

    const result = await handler.execute(new GetCertificateQuery(1, 7));

    expect(findOneBySpy).toHaveBeenCalledWith({ courseId: 1, userId: 7 });
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(pdfGenerator.generateCertificatePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "John Doe",
        courseTitle: "Chess basics",
        code: "new-code",
      }),
    );
    expect(result).toEqual(Buffer.from("fake-pdf"));
  });

  it("is idempotent: reuses an existing Certificate row instead of creating a second one on repeat calls", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course() as any);
    jest
      .spyOn(LessonProgress, "findBy")
      .mockResolvedValue([{ lessonId: 1 }, { lessonId: 2 }] as any);
    const existingCertificate = {
      code: "existing-code",
      createdAt: new Date("2025-06-01"),
    };
    jest.spyOn(Certificate, "findOneBy").mockResolvedValue(existingCertificate as any);
    const createSpy = jest.spyOn(Certificate, "create");
    const saveSpy = jest.spyOn(Certificate, "save");
    jest.spyOn(User, "findOneBy").mockResolvedValue(user as any);

    await handler.execute(new GetCertificateQuery(1, 7));

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(pdfGenerator.generateCertificatePdf).toHaveBeenCalledWith(
      expect.objectContaining({ code: "existing-code" }),
    );
  });
});
