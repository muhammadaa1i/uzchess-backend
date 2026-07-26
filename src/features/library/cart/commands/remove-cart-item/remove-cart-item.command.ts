export class RemoveCartItemCommand {
  constructor(
    public readonly bookId: number,
    public readonly userId: number,
  ) {}
}
