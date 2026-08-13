import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class UpdateCartItemQuantityResponse {
    @ApiProperty()
    @Expose()
    bookId: number;

    @ApiProperty()
    @Expose()
    quantity: number;
}
