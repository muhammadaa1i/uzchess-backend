import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {typeOrmConfig} from './core/configs/typeorm.config';
import {CommonModule} from '@/features/common/common.module';
import {AuthModule} from "./features/auth/auth.module";
import {JwtModule} from "@nestjs/jwt";
import {APP_GUARD} from "@nestjs/core";
import {AuthGuard} from "@/core/guards/auth.guard";
import {AuthorModule} from "@/features/library/author/author.module";
import {CategoryModule} from "@/features/library/category/category.module";
import {Role} from "@/core/enums/role.enum";
import {RoleGuard} from "@/core/guards/role.guard";

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: 'ForTheLoveOfGodDoNotUseInProduction',
            signOptions: {
                expiresIn: '1d'
            }
        }),
        TypeOrmModule.forRoot(typeOrmConfig),
        AuthModule,
        AuthorModule,
        CategoryModule,
        CommonModule,
    ],
    providers: [
        {provide: APP_GUARD, useClass: AuthGuard},
        {provide: APP_GUARD, useClass: RoleGuard}
    ]
})
export class AppModule {
}
