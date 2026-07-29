export class GetCourseReviewsQuery {
  constructor(
    public readonly courseId: number,
    public readonly page?: number,
    public readonly size?: number,
  ) {}
}
