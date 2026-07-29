export class UpdateLessonCommand {
    constructor(
        public readonly id: number,
        public readonly title: string | undefined,
        public readonly duration: number | undefined,
        public readonly order: number | undefined,
        public readonly videoPath: string | undefined,
        public readonly thumbnailPath: string | undefined,
    ) {
    }
}
