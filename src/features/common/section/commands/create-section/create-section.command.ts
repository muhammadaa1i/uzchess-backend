export class CreateSectionCommand {
    constructor(
        public readonly courseId: number,
        public readonly title: string,
        public readonly order: number,
    ) {
    }
}
