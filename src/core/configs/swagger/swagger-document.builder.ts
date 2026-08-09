import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { SwaggerDocGroup } from "@/core/configs/swagger/swagger-doc-groups";

export function buildSwaggerDocument(
  app: INestApplication,
  group: SwaggerDocGroup,
): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(group.title)
    .setVersion("v1.0.0")
    .addBearerAuth()
    .addSecurityRequirements("bearer")
    .build();

  return SwaggerModule.createDocument(app, config, {
    include: group.include,
    autoTagControllers: false,
  });
}
