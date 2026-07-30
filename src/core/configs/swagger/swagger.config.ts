import { INestApplication } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { SWAGGER_DOC_GROUPS } from "@/core/configs/swagger/swagger-doc-groups";
import { buildSwaggerDocument } from "@/core/configs/swagger/swagger-document.builder";

export function configureSwagger(app: INestApplication) {
  for (const group of SWAGGER_DOC_GROUPS) {
    const document = buildSwaggerDocument(app, group);
    SwaggerModule.setup(group.path, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }
}
