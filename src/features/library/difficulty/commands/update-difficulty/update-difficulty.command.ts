export class UpdateDifficultyCommand {
    constructor(
        public readonly id: number,
        public readonly degree: string,
        public readonly iconPath: string
    ) {
    }
}