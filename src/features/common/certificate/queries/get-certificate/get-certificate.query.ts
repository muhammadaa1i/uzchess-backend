export class GetCertificateQuery {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
  ) {}
}
