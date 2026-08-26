import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {In} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetCourseLessonsQuery} from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.query";
import {
    GetCourseLessonsResponse
} from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.response";
import {Course} from "@/features/common/entities/course/course.entity";
import {CoursePurchase} from "@/features/common/entities/purchase/course-purchase.entity";
import {PurchaseStatus} from "@/core/enums/purchase-status/purchase-status.enum";
import {LessonProgress} from "@/features/common/entities/progress/lesson-progress.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetCourseLessonsQuery)
export class GetCourseLessonsHandler
    implements IQueryHandler<GetCourseLessonsQuery> {
    async execute(query: GetCourseLessonsQuery) {
        const course = await Course.findOne({
            where: {id: query.courseId},
            relations: {sections: {lessons: true}},
        });
        DoesNotExistException.ThrowIfNull(course, "Course not found");

        const purchase = await CoursePurchase.findOneBy({
            courseId: query.courseId,
            userId: query.userId,
            status: PurchaseStatus.Success,
        });
        const isPurchased = !!purchase;

        const lessonIds = course.sections.flatMap((section) =>
            section.lessons.map((lesson) => lesson.id),
        );
        const progressRows = lessonIds.length
            ? await LessonProgress.findBy({
                userId: query.userId,
                lessonId: In(lessonIds),
            })
            : [];
        const completedLessonIds = new Set(
            progressRows.map((row) => row.lessonId),
        );

        const sections = [...course.sections]
            .sort((a, b) => a.order - b.order)
            .map((section) => ({
                ...section,
                lessons: [...section.lessons]
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => {
                        const locked = !lesson.isFree && !isPurchased;
                        return {
                            ...lesson,
                            locked,
                            completed: completedLessonIds.has(lesson.id),
                            video: locked ? null : lesson.video,
                        };
                    }),
            }));

        return plainToInstance(
            GetCourseLessonsResponse,
            {sections},
            {excludeExtraneousValues: true},
        );
    }
}
