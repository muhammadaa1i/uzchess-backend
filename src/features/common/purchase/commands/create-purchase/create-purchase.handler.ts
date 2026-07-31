import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePurchaseCommand} from "@/features/common/purchase/commands/create-purchase/create-purchase.command";
import {Course} from "@/features/common/entities/course/course.entity";
import {CoursePurchase} from "@/features/common/entities/purchase/course-purchase.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreatePurchaseResponse} from "@/features/common/purchase/commands/create-purchase/create-purchase.response";
import {PurchaseStatus} from "@/core/enums/purchase-status.enum";

@CommandHandler(CreatePurchaseCommand)
export class CreatePurchaseHandler
    implements ICommandHandler<CreatePurchaseCommand> {
    async execute(cmd: CreatePurchaseCommand) {
        const course = await Course.findOne({where: {id: cmd.courseId}});
        DoesNotExistException.ThrowIfNull(course, "Course not found");

        const existingPurchase = await CoursePurchase.findOneBy({
            courseId: cmd.courseId,
            userId: cmd.userId,
        });
        AlreadyExistException.ThrowIf(!!existingPurchase, "Course already purchased");

        const purchase = CoursePurchase.create({
            courseId: cmd.courseId,
            userId: cmd.userId,
            status: PurchaseStatus.Pending,
        });
        await CoursePurchase.save(purchase);

        purchase.status = PurchaseStatus.Success;
        await CoursePurchase.save(purchase);

        return plainToInstance(
            CreatePurchaseResponse,
            purchase,
            {excludeExtraneousValues: true},
        );
    }
}
