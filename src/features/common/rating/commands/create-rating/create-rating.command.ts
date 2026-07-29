export class CreateRatingCommand {
    constructor(
        public readonly courseId: number,
        public readonly userId: number,
        public readonly score: number,
        public readonly comment: string | undefined,
    ) {
    }
}
