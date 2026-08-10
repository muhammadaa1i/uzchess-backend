import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {UserModule} from "@/features/auth/user/user.module";
import {ProfileModule} from "@/features/auth/profile/profile.module";

@Module({
    imports: [CqrsModule, UserModule, ProfileModule],
})
export class AuthModule {
}
