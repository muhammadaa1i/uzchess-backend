import { CreateContactRequest } from "@/features/home/contact/commands/create-contact/create-contact.request";

export class CreateContactCommand {
  constructor(public readonly payload: CreateContactRequest) {}
}
