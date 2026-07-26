import "./env";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { configureSwagger } from "@/core/configs/swagger.config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });
  configureSwagger(app);
  await app.listen(process.env.PORT ?? 8000);
}

void bootstrap();
