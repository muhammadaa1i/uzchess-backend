import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException} from "@nestjs/common";
import {In} from "typeorm";
import {plainToInstance} from "class-transformer";
import {randomUUID} from "crypto";
import {
    CreateLessonProgressCommand
} from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.command";
import {
    CreateLessonProgressResponse
} from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.response";
import {CourseLesson} from "@/features/common/entities/section/course-lesson.entity";
import {Course} from "@/features/common/entities/course/course.entity";
import {CoursePurchase} from "@/features/common/entities/purchase/course-purchase.entity";
import {PurchaseStatus} from "@/core/enums/purchase-status/purchase-status.enum";
import {LessonProgress} from "@/features/common/entities/progress/lesson-progress.entity";
import {Certificate} from "@/features/common/entities/certificate/certificate.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@CommandHandler(CreateLessonProgressCommand)
export class CreateLessonProgressHandler
    implements ICommandHandler<CreateLessonProgressCommand> {
    async execute(cmd: CreateLessonProgressCommand) {
        const lesson = await CourseLesson.findOne({
            where: {id: cmd.lessonId},
            relations: {section: true},
        });
        DoesNotExistException.ThrowIfNull(lesson, "Lesson not found");

        if (!lesson.isFree) {
            const purchase = await CoursePurchase.findOneBy({
                courseId: lesson.section.courseId,
                userId: cmd.userId,
                status: PurchaseStatus.Success,
            });
            if (!purchase) {
                throw new ForbiddenException("Course must be purchased to access this lesson");
            }
        }

        const existing = await LessonProgress.findOneBy({
            lessonId: cmd.lessonId,
            userId: cmd.userId,
        });
        const progress =
            existing ??
            (await LessonProgress.save(
                LessonProgress.create({
                    lessonId: cmd.lessonId,
                    userId: cmd.userId,
                }),
            ));

        await this.issueCertificateIfCourseCompleted(
            lesson.section.courseId,
            cmd.userId,
        );

        return plainToInstance(CreateLessonProgressResponse, progress, {
            excludeExtraneousValues: true,
        });
    }

    private async issueCertificateIfCourseCompleted(
        courseId: number,
        userId: number,
    ) {
        const course = await Course.findOne({
            where: {id: courseId},
            relations: {sections: {lessons: true}},
        });
        if (!course) return;

        const lessonIds = course.sections.flatMap((section) =>
            section.lessons.map((l) => l.id),
        );
        if (!lessonIds.length) return;

        const completedCount = await LessonProgress.countBy({
            lessonId: In(lessonIds),
            userId,
        });
        if (completedCount < lessonIds.length) return;

        if (course.price !== 0) {
            const purchase = await CoursePurchase.findOneBy({
                courseId,
                userId,
                status: PurchaseStatus.Success,
            });
            if (!purchase) return;
        }

        const existingCertificate = await Certificate.findOneBy({
            courseId,
            userId,
        });
        if (existingCertificate) return;

        await Certificate.save(
            Certificate.create({courseId, userId, code: randomUUID()}),
        );
    }
}
