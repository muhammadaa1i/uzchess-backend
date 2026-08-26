export class CreateLessonProgressCommand {
    constructor(
        public readonly userId: number,
        public readonly lessonId: number,
    ) {
    }
}
