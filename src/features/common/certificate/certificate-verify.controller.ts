import {Controller, Get, Param} from "@nestjs/common";
import {QueryBus} from "@nestjs/cqrs";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Public} from "@/core/decorators/public.decorator";
import {
    VerifyCertificateQuery
} from "@/features/common/certificate/queries/verify-certificate/verify-certificate.query";
import {
    VerifyCertificateResponse
} from "@/features/common/certificate/queries/verify-certificate/verify-certificate.response";

@ApiTags("Certificate")
@Controller("certificates")
export class CertificateVerifyController {
    constructor(private readonly queryBus: QueryBus) {
    }

    @Public()
    @Get(":code/verify")
    @ApiOkResponse({type: VerifyCertificateResponse})
    async verify(@Param("code") code: string) {
        return await this.queryBus.execute(new VerifyCertificateQuery(code));
    }
}
