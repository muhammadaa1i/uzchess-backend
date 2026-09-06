import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ContactController } from "@/features/home/contact/contact.controller";
import { CreateContactHandler } from "@/features/home/contact/commands/create-contact/create-contact.handler";
import { GetContactsHandler } from "@/features/home/contact/queries/get-contacts/get-contacts.handler";

@Module({
  imports: [CqrsModule],
  controllers: [ContactController],
  providers: [CreateContactHandler, GetContactsHandler],
})
export class ContactModule {}
