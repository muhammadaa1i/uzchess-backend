export class CreateLanguageCommand {
  constructor(
    public readonly title: string,
    public readonly code: string,
  ) {}
}
