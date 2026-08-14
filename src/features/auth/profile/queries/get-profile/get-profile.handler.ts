import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetProfileQuery} from "@/features/auth/profile/queries/get-profile/get-profile.query";
import {User} from "@/features/auth/entities/user/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {GetProfileResponse} from "@/features/auth/profile/queries/get-profile/get-profile.response";

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
    async execute(query: GetProfileQuery) {
        const user = await User.findOneBy({id: query.userId});
        DoesNotExistException.ThrowIfNull(user, "User not found");

        return plainToInstance(GetProfileResponse, user, {
            excludeExtraneousValues: true,
        });
    }
}
