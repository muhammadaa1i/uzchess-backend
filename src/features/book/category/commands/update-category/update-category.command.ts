export class UpdateCategoryCommand {
  constructor(
    public readonly id: number,
    public readonly title: string,
  ) {}
}
