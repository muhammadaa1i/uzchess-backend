import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCertificateQuery} from "@/features/common/certificate/queries/get-certificate/get-certificate.query";
import {generateCertificatePdf} from "@/core/utils/certificate-pdf/certificate-pdf.generator";
import {Course} from "@/features/common/entities/course/course.entity";
import {Certificate} from "@/features/common/entities/certificate/certificate.entity";
import {User} from "@/features/auth/entities/user/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetCertificateQuery)
export class GetCertificateHandler implements IQueryHandler<GetCertificateQuery> {
    async execute(query: GetCertificateQuery) {
        const course = await Course.findOne({where: {id: query.courseId}});
        DoesNotExistException.ThrowIfNull(course, "Course not found");

        const certificate = await Certificate.findOneBy({
            courseId: query.courseId,
            userId: query.userId,
        });
        DoesNotExistException.ThrowIfNull(
            certificate,
            "Certificate not earned yet — complete all lessons in this course to unlock it",
        );

        const user = await User.findOneBy({id: query.userId});
        DoesNotExistException.ThrowIfNull(user, "User not found");

        return await generateCertificatePdf({
            fullName: `${user.firstName} ${user.lastName}`,
            courseTitle: course.title,
            code: certificate.code,
            issuedAt: certificate.createdAt,
        });
    }
}
