import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import {Observable, catchError, throwError} from "rxjs";
import {deleteUploadedFile} from "@/core/configs/multer/multer.config";
import type {Request} from "express";

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();

        return next.handle().pipe(
            catchError((error) => {
                const files = request.file
                    ? [request.file]
                    : Array.isArray(request.files)
                        ? request.files
                        : Object.values(request.files ?? {}).flat();

                for (const file of files) {
                    deleteUploadedFile(file.path).catch(() => {
                    });
                }

                return throwError(() => error);
            }),
        );
    }
}
