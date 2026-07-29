export class UpdateCourseCategoryCommand {
    constructor(
        public readonly id: number,
        public readonly title: string,
    ) {
    }
}
