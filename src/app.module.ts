import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "./core/configs/typeorm.config";
import { CommonModule } from "@/features/common/common.module";
import { AuthModule } from "./features/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "@/core/guards/auth.guard";
import { RoleGuard } from "@/core/guards/role.guard";
import { PermissionGuard } from "@/core/guards/permission.guard";
import { CqrsModule } from "@nestjs/cqrs";
import { CacheModule } from "@nestjs/cache-manager";
import { LibraryModule } from "@/features/library/library.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "7d",
      },
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    CqrsModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 1000 * 60 * 30,
    }),
    AuthModule,
    LibraryModule,
    CommonModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
