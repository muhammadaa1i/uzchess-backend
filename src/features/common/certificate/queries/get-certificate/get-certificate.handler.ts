import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ForbiddenException } from "@nestjs/common";
import { In } from "typeorm";
import { GetCertificateQuery } from "@/features/common/certificate/queries/get-certificate/get-certificate.query";
import { generateCertificatePdf } from "@/features/common/certificate/certificate-pdf.generator";
import { Course } from "@/features/common/entities/course/course.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { PurchaseStatus } from "@/core/enums/purchase-status.enum";
import { LessonProgress } from "@/features/common/entities/progress/lesson-progress.entity";
import { Certificate } from "@/features/common/entities/certificate/certificate.entity";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { randomUUID } from "crypto";

@QueryHandler(GetCertificateQuery)
export class GetCertificateHandler implements IQueryHandler<GetCertificateQuery> {
  async execute(query: GetCertificateQuery) {
    const course = await Course.findOne({
      where: { id: query.courseId },
      relations: { sections: { lessons: true } },
    });
    DoesNotExistException.ThrowIfNull(course, "Course not found");

    const lessonIds = course.sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id),
    );

    const progresses = lessonIds.length
      ? await LessonProgress.findBy({
          lessonId: In(lessonIds),
          userId: query.userId,
        })
      : [];
    if (progresses.length < lessonIds.length) {
      throw new ForbiddenException("Course not fully completed");
    }

    if (course.price !== 0) {
      const purchase = await CoursePurchase.findOneBy({
        courseId: query.courseId,
        userId: query.userId,
        status: PurchaseStatus.Success,
      });
      if (!purchase) {
        throw new ForbiddenException(
          "Course must be purchased to access this certificate",
        );
      }
    }

    const existing = await Certificate.findOneBy({
      courseId: query.courseId,
      userId: query.userId,
    });
    const certificate =
      existing ??
      (await Certificate.save(
        Certificate.create({
          courseId: query.courseId,
          userId: query.userId,
          code: randomUUID(),
        }),
      ));

    const user = await User.findOneBy({ id: query.userId });
    DoesNotExistException.ThrowIfNull(user, "User not found");

    return await generateCertificatePdf({
      fullName: user.fullName,
      courseTitle: course.title,
      code: certificate.code,
      issuedAt: certificate.createdAt,
    });
  }
}
