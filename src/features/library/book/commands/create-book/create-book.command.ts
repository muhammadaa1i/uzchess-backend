export class CreateBookCommand {
    constructor(
        public readonly title: string,
        public readonly price: number,
        public readonly discountPrice: number | undefined,
        public readonly description: string,
        public readonly pageCount: number,
        public readonly publishedYear: number,
        public readonly categoryId: number,
        public readonly difficultyId: number,
        public readonly languageId: number,
        public readonly authorIds: number[],
        public readonly coverPath: string,
    ) {
    }
}
