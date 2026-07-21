export class UpdateAuthorCommand {
  constructor(
    public readonly id: number,
    public readonly fullName: string,
  ) {}
}
