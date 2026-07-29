export class CreateCourseCommand {
    constructor(
        public readonly title: string,
        public readonly price: number,
        public readonly discountPrice: number | undefined,
        public readonly description: string,
        public readonly categoryId: number,
        public readonly difficultyId: number,
        public readonly languageId: number,
        public readonly authorIds: number[],
        public readonly coverPath: string,
    ) {
    }
}
