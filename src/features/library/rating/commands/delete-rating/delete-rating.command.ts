export class DeleteRatingCommand {
    constructor(
        public readonly bookId: number,
        public readonly userId: number,
    ) {
    }
}
