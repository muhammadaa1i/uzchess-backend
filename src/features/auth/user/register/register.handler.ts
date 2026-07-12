import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RegisterCommand} from "@/features/auth/user/register/register.command";
import {User} from "@/features/auth/entities/user.entity";
import argon2 from 'argon2'
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
    async execute({payload}: RegisterCommand) {
        const alreadyExist = await User.existsBy({username: payload.username})
        AlreadyExistException.ThrowIf(alreadyExist)

        const newUser = User.create(payload)
        newUser.password = await argon2.hash(newUser.password)
        return await User.save(newUser)
    }
}