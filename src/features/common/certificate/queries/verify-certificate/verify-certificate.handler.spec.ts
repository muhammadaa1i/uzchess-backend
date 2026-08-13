import { VerifyCertificateHandler } from "@/features/common/certificate/queries/verify-certificate/verify-certificate.handler";
import { VerifyCertificateQuery } from "@/features/common/certificate/queries/verify-certificate/verify-certificate.query";
import { Certificate } from "@/features/common/entities/certificate/certificate.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("VerifyCertificateHandler", () => {
  let handler: VerifyCertificateHandler;

  beforeEach(() => {
    handler = new VerifyCertificateHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns student/course/date for a valid code", async () => {
    const createdAt = new Date("2026-01-15T00:00:00.000Z");
    const findOneSpy = jest.spyOn(Certificate, "findOne").mockResolvedValue({
      code: "valid-code",
      createdAt,
      user: { firstName: "Jane", lastName: "Smith" },
      course: { title: "Advanced Chess" },
    } as any);

    const result = await handler.execute(new VerifyCertificateQuery("valid-code"));

    expect(findOneSpy).toHaveBeenCalledWith({
      where: { code: "valid-code" },
      relations: { course: true, user: true },
    });
    expect(result.studentName).toBe("Jane Smith");
    expect(result.courseTitle).toBe("Advanced Chess");
    expect(result.issuedAt).toEqual(createdAt);
  });

  it("throws DoesNotExistException (404) for an unknown/bogus code", async () => {
    jest.spyOn(Certificate, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new VerifyCertificateQuery("bogus-code")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
