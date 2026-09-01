import {INestApplication, Logger} from "@nestjs/common";
import {SwaggerModule} from "@nestjs/swagger";
import basicAuth from "express-basic-auth";
import {SWAGGER_DOC_GROUPS} from "@/core/configs/swagger/swagger-doc-groups";
import {buildSwaggerDocument} from "@/core/configs/swagger/swagger-document.builder";

export function configureSwagger(app: INestApplication): boolean {
    if (process.env.NODE_ENV === "production") {
        const user = process.env.SWAGGER_USER;
        const password = process.env.SWAGGER_PASSWORD;

        if (!user || !password) {
            Logger.warn(
                "SWAGGER_USER/SWAGGER_PASSWORD are not set — Swagger docs are disabled in production.",
                "Swagger",
            );
            return false;
        }

        app.use(
            SWAGGER_DOC_GROUPS.map((group) => `/${group.path}`),
            basicAuth({users: {[user]: password}, challenge: true}),
        );
    }

    for (const group of SWAGGER_DOC_GROUPS) {
        const document = buildSwaggerDocument(app, group);
        SwaggerModule.setup(group.path, app, document, {
            swaggerOptions: {persistAuthorization: true},
        });
    }

    return true;
}
