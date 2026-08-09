import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {plainToInstance} from "class-transformer";
import {
    VerifyCertificateQuery
} from "@/features/common/certificate/queries/verify-certificate/verify-certificate.query";
import {
    VerifyCertificateResponse
} from "@/features/common/certificate/queries/verify-certificate/verify-certificate.response";
import {Certificate} from "@/features/common/entities/certificate/certificate.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(VerifyCertificateQuery)
export class VerifyCertificateHandler
    implements IQueryHandler<VerifyCertificateQuery> {
    async execute(query: VerifyCertificateQuery) {
        const certificate = await Certificate.findOne({
            where: {code: query.code},
            relations: {course: true, user: true},
        });
        DoesNotExistException.ThrowIfNull(certificate, "Certificate not found");

        return plainToInstance(
            VerifyCertificateResponse,
            {
                studentName: `${certificate.user.firstName} ${certificate.user.lastName}`,
                courseTitle: certificate.course.title,
                issuedAt: certificate.createdAt,
            },
            {excludeExtraneousValues: true},
        );
    }
}
