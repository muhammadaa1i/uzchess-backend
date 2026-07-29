export class AddFavouriteCommand {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
  ) {}
}
