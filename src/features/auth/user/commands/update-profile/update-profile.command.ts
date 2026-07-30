export class UpdateProfileCommand {
  constructor(
    public readonly id: number,
    public readonly fullName: string | undefined,
    public readonly avatarPath: string | undefined,
  ) {}
}
