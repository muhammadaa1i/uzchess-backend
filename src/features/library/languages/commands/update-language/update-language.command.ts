export class UpdateLanguageCommand {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly code: string,
    ) {
    }
}
