import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateProfileCommand } from "@/features/auth/user/commands/update-profile/update-profile.command";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateProfileResponse } from "@/features/auth/user/commands/update-profile/update-profile.response";
import { deleteUploadedFile } from "@/core/configs/multer.config";

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  async execute(cmd: UpdateProfileCommand) {
    const user = await User.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(user, "User not found");

    if (cmd.fullName !== undefined) user.fullName = cmd.fullName;

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
