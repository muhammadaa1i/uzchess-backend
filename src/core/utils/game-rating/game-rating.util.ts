import {GameType} from "@/core/enums/game-type/game-type.enum";
import {Player} from "@/features/home/entities/player/player.entity";

export function ratingForGameType(player: Player, gameType: GameType): number {
    switch (gameType) {
        case GameType.Rapid:
            return player.rapidRating;
        case GameType.Blitz:
            return player.blitzRating;
        case GameType.Bullet:
        default:
            return player.classicalRating;
    }
}
