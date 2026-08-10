import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UnauthorizedException} from "@nestjs/common";
import {RefreshTokenCommand} from "@/features/auth/user/commands/refresh-token/refresh-token.command";
import {RefreshToken} from "@/features/auth/entities/refresh-token.entity";
import {createHash, randomBytes} from "crypto";
import {JwtService} from "@nestjs/jwt";
import {Role} from "@/core/enums/role.enum";
import {plainToInstance} from "class-transformer";
import {RefreshTokenResponse} from "@/features/auth/user/commands/refresh-token/refresh-token.response";

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
    constructor(private jwtService: JwtService) {
    }

    async execute({payload}: RefreshTokenCommand) {
        const tokenHash = createHash("sha256")
            .update(payload.refreshToken)
            .digest("hex");

        const refreshToken = await RefreshToken.findOne({
            where: {tokenHash},
            relations: {user: {userRoles: {role: true}}},
        });

        if (
            !refreshToken ||
            refreshToken.revokedAt ||
            new Date(refreshToken.expiresAt) < new Date()
        ) {
            throw new UnauthorizedException();
        }

        refreshToken.revokedAt = new Date().toISOString();
        await RefreshToken.save(refreshToken);

        const rawRefreshToken = randomBytes(64).toString("hex");
        const newTokenHash = createHash("sha256")
            .update(rawRefreshToken)
            .digest("hex");

        const newRefreshToken = RefreshToken.create({
            userId: refreshToken.userId,
            tokenHash: newTokenHash,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await RefreshToken.save(newRefreshToken);

        const jwtPayload = {
            id: refreshToken.user.id,
            roles: refreshToken.user.userRoles.map((ur) => ur.role.title as Role),
        };

        const accessToken = this.jwtService.sign(jwtPayload);

        return plainToInstance(
            RefreshTokenResponse,
            {accessToken, refreshToken: rawRefreshToken},
            {excludeExtraneousValues: true},
        );
    }
}
