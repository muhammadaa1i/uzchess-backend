import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {ProfileController} from "@/features/auth/profile/profile.controller";
import {GetProfileHandler} from "@/features/auth/profile/queries/get-profile/get-profile.handler";
import {UpdateProfileHandler} from "@/features/auth/profile/commands/update-profile/update-profile.handler";
import {ChangePasswordHandler} from "@/features/auth/profile/commands/change-password/change-password.handler";
import {ChangeEmailHandler} from "@/features/auth/profile/commands/change-email/change-email.handler";
import {ResendEmailHandler} from "@/features/auth/profile/commands/resend-email/resend-email.handler";
import {ConfirmEmailHandler} from "@/features/auth/profile/commands/confirm-email/confirm-email.handler";

@Module({
    imports: [CqrsModule],
    controllers: [ProfileController],
    providers: [
        GetProfileHandler,
        UpdateProfileHandler,
        ChangePasswordHandler,
        ChangeEmailHandler,
        ResendEmailHandler,
        ConfirmEmailHandler,
    ],
})
export class ProfileModule {
}
