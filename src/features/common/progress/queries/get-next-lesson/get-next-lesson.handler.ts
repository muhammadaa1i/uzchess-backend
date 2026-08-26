import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {plainToInstance} from "class-transformer";
import {GetNextLessonQuery} from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.query";
import {GetNextLessonResponse} from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.response";
import {CourseLesson} from "@/features/common/entities/section/course-lesson.entity";
import {Course} from "@/features/common/entities/course/course.entity";
import {CoursePurchase} from "@/features/common/entities/purchase/course-purchase.entity";
import {PurchaseStatus} from "@/core/enums/purchase-status/purchase-status.enum";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetNextLessonQuery)
export class GetNextLessonHandler
    implements IQueryHandler<GetNextLessonQuery> {
    async execute(query: GetNextLessonQuery) {
        const lesson = await CourseLesson.findOne({
            where: {id: query.lessonId},
            relations: {section: true},
        });
        DoesNotExistException.ThrowIfNull(lesson, "Lesson not found");

        const course = await Course.findOne({
            where: {id: lesson.section.courseId},
            relations: {sections: {lessons: true}},
        });
        DoesNotExistException.ThrowIfNull(course, "Course not found");

        const orderedLessons = [...course.sections]
            .sort((a, b) => a.order - b.order)
            .flatMap((section) =>
                [...section.lessons].sort((a, b) => a.order - b.order),
            );

        const currentIndex = orderedLessons.findIndex(
            (l) => l.id === lesson.id,
        );
        const nextLesson = orderedLessons[currentIndex + 1];

        if (!nextLesson) {
            return plainToInstance(
                GetNextLessonResponse,
                {hasNext: false, lessonId: null, locked: null, video: null},
                {excludeExtraneousValues: true},
            );
        }

        const purchase = await CoursePurchase.findOneBy({
            courseId: lesson.section.courseId,
            userId: query.userId,
            status: PurchaseStatus.Success,
        });
        const isPurchased = !!purchase;
        const locked = !nextLesson.isFree && !isPurchased;

        return plainToInstance(
            GetNextLessonResponse,
            {
                hasNext: true,
                lessonId: nextLesson.id,
                locked,
                video: locked ? null : nextLesson.video,
            },
            {excludeExtraneousValues: true},
        );
    }
}
