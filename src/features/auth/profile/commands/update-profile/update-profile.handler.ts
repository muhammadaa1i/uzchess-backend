import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateProfileCommand } from "@/features/auth/profile/commands/update-profile/update-profile.command";
import { User } from "@/features/auth/entities/user/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateProfileResponse } from "@/features/auth/profile/commands/update-profile/update-profile.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  async execute(cmd: UpdateProfileCommand) {
    const user = await User.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(user, "User not found");

    if (cmd.payload.firstName !== undefined) user.firstName = cmd.payload.firstName;
    if (cmd.payload.lastName !== undefined) user.lastName = cmd.payload.lastName;
    if (cmd.payload.birthDate !== undefined)
      user.birthDate = new Date(cmd.payload.birthDate);

    if (cmd.avatarPath) {
      const oldAvatar = user.avatar;
      user.avatar = cmd.avatarPath;
      if (oldAvatar) await deleteUploadedFile(oldAvatar).catch(() => {});
    }

    const saved = await user.save();

    return plainToInstance(UpdateProfileResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
