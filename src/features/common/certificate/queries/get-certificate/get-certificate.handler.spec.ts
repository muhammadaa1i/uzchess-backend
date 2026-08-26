import { GetCertificateHandler } from "@/features/common/certificate/queries/get-certificate/get-certificate.handler";
import { GetCertificateQuery } from "@/features/common/certificate/queries/get-certificate/get-certificate.query";
import { Course } from "@/features/common/entities/course/course.entity";
import { Certificate } from "@/features/common/entities/certificate/certificate.entity";
import { User } from "@/features/auth/entities/user/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import * as pdfGenerator from "@/core/utils/certificate-pdf/certificate-pdf.generator";

jest.mock("@/core/utils/certificate-pdf/certificate-pdf.generator", () => ({
  generateCertificatePdf: jest.fn(),
}));

describe("GetCertificateHandler", () => {
  let handler: GetCertificateHandler;

  const course = { id: 1, title: "Chess basics" };
  const user = { id: 7, firstName: "John", lastName: "Doe" };
  const certificate = { code: "abc-123", createdAt: new Date("2026-01-01") };

  beforeEach(() => {
    handler = new GetCertificateHandler();
    jest
      .spyOn(pdfGenerator, "generateCertificatePdf")
      .mockResolvedValue(Buffer.from("fake-pdf") as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(null);
    const certificateSpy = jest.spyOn(Certificate, "findOneBy");

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(certificateSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when no certificate has been earned yet — never creates one", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course as any);
    jest.spyOn(Certificate, "findOneBy").mockResolvedValue(null);
    const createSpy = jest.spyOn(Certificate, "create");
    const saveSpy = jest.spyOn(Certificate, "save");

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course as any);
    jest.spyOn(Certificate, "findOneBy").mockResolvedValue(certificate as any);
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetCertificateQuery(1, 7)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("generates the pdf for an already-earned certificate without writing to the database", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(course as any);
    jest.spyOn(Certificate, "findOneBy").mockResolvedValue(certificate as any);
    jest.spyOn(User, "findOneBy").mockResolvedValue(user as any);
    const createSpy = jest.spyOn(Certificate, "create");
    const saveSpy = jest.spyOn(Certificate, "save");

    const result = await handler.execute(new GetCertificateQuery(1, 7));

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(pdfGenerator.generateCertificatePdf).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "John Doe",
        courseTitle: "Chess basics",
        code: "abc-123",
      }),
    );
    expect(result).toEqual(Buffer.from("fake-pdf"));
  });
});
