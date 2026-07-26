import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { FavouriteController } from "@/features/library/favourite/favourite.controller";
import { AddFavouriteHandler } from "@/features/library/favourite/commands/add-favourite/add-favourite.handler";
import { RemoveFavouriteHandler } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.handler";
import { GetFavouritesHandler } from "@/features/library/favourite/queries/get-favourites/get-favourites.handler";

@Module({
  imports: [CqrsModule],
  controllers: [FavouriteController],
  providers: [
    AddFavouriteHandler,
    RemoveFavouriteHandler,
    GetFavouritesHandler,
  ],
})
export class FavouriteModule {}
