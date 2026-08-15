import "./env";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ValidationPipe} from "@nestjs/common";
import {configureSwagger} from "@/core/configs/swagger/swagger.config";
import {printSwaggerLinks} from "@/core/configs/swagger/swagger-links.printer";
import {NestExpressApplication} from "@nestjs/platform-express";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        }),
    );

    configureSwagger(app);
    const port = Number(process.env.PORT) || 8000;
    await app.listen(port);
    printSwaggerLinks(`http://localhost:${port}`);
}

void bootstrap();