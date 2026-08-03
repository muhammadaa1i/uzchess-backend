import { GetSectionsRequest } from "@/features/common/section/queries/get-sections/get-sections.request";

export class GetSectionsQuery {
  constructor(public readonly payload: GetSectionsRequest) {}
}
