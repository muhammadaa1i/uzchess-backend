export class GetCategoriesQuery {
  constructor(
    public readonly search?: string,
    // pagination disabled - category list stays small, kept for potential future reuse
    // public readonly page?: number,
    // public readonly size?: number,
  ) {}
}
