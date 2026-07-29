export class DeleteRatingCommand {
    constructor(
        public readonly courseId: number,
        public readonly userId: number,
    ) {
    }
}
