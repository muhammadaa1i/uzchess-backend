import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {CertificateController} from "@/features/common/certificate/certificate.controller";
import {CertificateVerifyController} from "@/features/common/certificate/certificate-verify.controller";
import {GetCertificateHandler} from "@/features/common/certificate/queries/get-certificate/get-certificate.handler";
import {
    VerifyCertificateHandler
} from "@/features/common/certificate/queries/verify-certificate/verify-certificate.handler";

@Module({
    imports: [CqrsModule],
    controllers: [CertificateController, CertificateVerifyController],
    providers: [GetCertificateHandler, VerifyCertificateHandler],
})
export class CertificateModule {
}
