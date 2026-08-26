export class GetNextLessonQuery {
    constructor(
        public readonly lessonId: number,
        public readonly userId: number,
    ) {
    }
}
