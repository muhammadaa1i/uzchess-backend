import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { FavouriteController } from "@/features/common/favourite/favourite.controller";
import { AddFavouriteHandler } from "@/features/common/favourite/commands/add-favourite/add-favourite.handler";
import { RemoveFavouriteHandler } from "@/features/common/favourite/commands/remove-favourite/remove-favourite.handler";
import { GetFavouritesHandler } from "@/features/common/favourite/queries/get-favourites/get-favourites.handler";

@Module({
  imports: [CqrsModule],
  controllers: [FavouriteController],
  providers: [AddFavouriteHandler, RemoveFavouriteHandler, GetFavouritesHandler],
})
export class FavouriteModule {}
