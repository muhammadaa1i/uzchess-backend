export class UpdateSectionCommand {
  constructor(
    public readonly id: number,
    public readonly title: string | undefined,
    public readonly order: number | undefined,
  ) {}
}
