export class GetBooksQuery {
    constructor(
        public readonly search?: string,
        public readonly categoryId?: number,
        public readonly difficultyId?: number,
        public readonly languageId?: number,
        public readonly minRating?: number,
        public readonly page?: number,
        public readonly size?: number,
    ) {
    }
}
