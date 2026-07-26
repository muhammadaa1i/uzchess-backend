export class RemoveFavouriteCommand {
  constructor(
    public readonly bookId: number,
    public readonly userId: number,
  ) {}
}
