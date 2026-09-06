import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { plainToInstance } from "class-transformer";
import { GetContactsQuery } from "@/features/home/contact/queries/get-contacts/get-contacts.query";
import { GetContactsResponse } from "@/features/home/contact/queries/get-contacts/get-contacts.response";
import { ContactMessage } from "@/features/home/entities/contact-message/contact-message.entity";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";

@QueryHandler(GetContactsQuery)
export class GetContactsHandler implements IQueryHandler<GetContactsQuery> {
  async execute(query: GetContactsQuery) {
    const contactMessages = await ContactMessage.find({
      order: { createdAt: "DESC" },
    });

    const take = query.payload.size ?? 12;
    const currentPage = query.payload.page ?? 1;
    const skip = (currentPage - 1) * take;
    const totalCount = contactMessages.length;
    const totalPages = Math.ceil(totalCount / take);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const data = plainToInstance(
      GetContactsResponse,
      contactMessages.slice(skip, skip + take),
      { excludeExtraneousValues: true },
    );

    return plainToInstance(
      PaginatedResultDto(GetContactsResponse),
      { totalCount, totalPages, currentPage, hasNext, hasPrevious, data },
      { excludeExtraneousValues: true },
    );
  }
}
