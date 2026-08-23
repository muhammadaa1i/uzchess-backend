import {ratingForGameType} from "@/core/utils/game-rating/game-rating.util";
import {GameType} from "@/core/enums/game-type/game-type.enum";
import {Player} from "@/features/home/entities/player/player.entity";

describe("ratingForGameType", () => {
    const player = {
        classicalRating: 2100,
        rapidRating: 1950,
        blitzRating: 2400,
    } as Player;

    it("returns rapidRating for rapid games", () => {
        expect(ratingForGameType(player, GameType.Rapid)).toBe(1950);
    });

    it("returns blitzRating for blitz games", () => {
        expect(ratingForGameType(player, GameType.Blitz)).toBe(2400);
    });

    it("falls back to classicalRating for bullet games", () => {
        expect(ratingForGameType(player, GameType.Bullet)).toBe(2100);
    });
});
