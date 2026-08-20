import {UpdateGameRequest} from "@/features/home/game/commands/update-game/update-game.request";

export class UpdateGameCommand {
    constructor(
        public readonly id: number,
        public readonly payload: UpdateGameRequest,
    ) {
    }
}
