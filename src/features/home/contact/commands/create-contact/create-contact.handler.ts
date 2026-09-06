import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { CreateContactCommand } from "@/features/home/contact/commands/create-contact/create-contact.command";
import { CreateContactResponse } from "@/features/home/contact/commands/create-contact/create-contact.response";
import { ContactMessage } from "@/features/home/entities/contact-message/contact-message.entity";
import { sendContactNotificationEmail } from "@/core/configs/mail/mail.service";

@CommandHandler(CreateContactCommand)
export class CreateContactHandler
  implements ICommandHandler<CreateContactCommand>
{
  async execute(cmd: CreateContactCommand) {
    const contactMessage = ContactMessage.create({
      name: cmd.payload.name,
      email: cmd.payload.email,
      message: cmd.payload.message,
    });
    const saved = await ContactMessage.save(contactMessage);

    sendContactNotificationEmail(
      saved.name,
      saved.email,
      saved.message,
    ).catch((error) => {
      Logger.error(
        `Failed to send contact notification email for submission ${saved.id}: ${error}`,
        undefined,
        "CreateContactHandler",
      );
    });

    return plainToInstance(CreateContactResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
