export class AddCartItemCommand {
  constructor(
    public readonly bookId: number,
    public readonly userId: number,
  ) {}
}
