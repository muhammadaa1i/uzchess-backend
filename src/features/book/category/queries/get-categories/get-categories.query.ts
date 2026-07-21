export class GetCategoriesQuery {
  constructor(
    public readonly search?: string,
    public readonly page?: number,
    public readonly size?: number,
  ) {}
}
