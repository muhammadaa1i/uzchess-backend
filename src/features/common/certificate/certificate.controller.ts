import {Controller, Get, Param, ParseIntPipe, Req, Res} from "@nestjs/common";
import type {Request, Response} from "express";
import {QueryBus} from "@nestjs/cqrs";
import {ApiTags} from "@nestjs/swagger";
import {GetCertificateQuery} from "@/features/common/certificate/queries/get-certificate/get-certificate.query";

@ApiTags("Certificate")
@Controller("courses")
export class CertificateController {
    constructor(private readonly queryBus: QueryBus) {
    }

    @Get(":id/certificate")
    async download(
        @Param("id", ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const buffer = await this.queryBus.execute(
            new GetCertificateQuery(id, req.user!.id),
        );
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="certificate-${id}.pdf"`,
        });
        res.send(buffer);
    }
}
