export class GetCourseLessonsQuery {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
  ) {}
}
