export class RateBookCommand {
    constructor(
        public readonly bookId: number,
        public readonly userId: number,
        public readonly score: number,
    ) {
    }
}
