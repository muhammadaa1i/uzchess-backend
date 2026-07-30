import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegisterCommand } from "@/features/auth/user/commands/register/register.command";
import { User } from "@/features/auth/entities/user.entity";
import argon2 from "argon2";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { RegisterResponse } from "@/features/auth/user/commands/register/register.response";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  async execute({ payload }: RegisterCommand) {
    const alreadyExist = await User.existsBy({ username: payload.username });
    AlreadyExistException.ThrowIf(alreadyExist);

    const newUser = User.create(payload);
    newUser.password = await argon2.hash(newUser.password);

    return plainToInstance(RegisterResponse, await User.save(newUser), {
      excludeExtraneousValues: true,
    });
  }
}
