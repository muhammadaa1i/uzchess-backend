export class RemoveFavouriteCommand {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
  ) {}
}
