export class CreateLessonCommand {
    constructor(
        public readonly sectionId: number,
        public readonly title: string,
        public readonly duration: number,
        public readonly order: number,
        public readonly videoPath: string,
        public readonly thumbnailPath: string | undefined,
    ) {
    }
}
