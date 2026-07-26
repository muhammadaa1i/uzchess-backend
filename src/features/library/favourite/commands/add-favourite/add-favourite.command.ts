export class AddFavouriteCommand {
  constructor(
    public readonly bookId: number,
    public readonly userId: number,
  ) {}
}
