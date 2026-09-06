import { GetContactsRequest } from "@/features/home/contact/queries/get-contacts/get-contacts.request";

export class GetContactsQuery {
  constructor(public readonly payload: GetContactsRequest) {}
}
