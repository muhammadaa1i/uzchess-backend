export class UpdateBookCommand {
    constructor(
        public readonly id: number,
        public readonly title: string | undefined,
        public readonly price: number | undefined,
        public readonly discountPrice: number | null | undefined,
        public readonly description: string | undefined,
        public readonly pageCount: number | undefined,
        public readonly publishedYear: number | undefined,
        public readonly categoryId: number | undefined,
        public readonly difficultyId: number | undefined,
        public readonly languageId: number | undefined,
        public readonly authorIds: number[] | undefined,
        public readonly coverPath: string | undefined,
    ) {
    }
}
