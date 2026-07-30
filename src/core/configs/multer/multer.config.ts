import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { StorageEngine } from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  r2Client,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} from "@/core/configs/r2/r2.config";

interface Params {
  destination: string;
  extensions: string[];
}

class R2StorageEngine implements StorageEngine {
  constructor(
    private readonly destination: string,
    private readonly extensions: string[],
  ) {}

  _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void,
  ) {
    const extension = file.originalname.split(".").at(-1);

    if (!extension || !this.extensions.includes(extension.toLowerCase())) {
      callback(new BadRequestException("This extension is not allowed."));
      return;
    }

    const filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
    const key = `${this.destination}/${filename}`;

    new Upload({
      client: r2Client,
      params: {
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file.stream,
        ContentType: file.mimetype,
      },
    })
      .done()
      .then(() => {
        callback(null, {
          filename,
          path: `${R2_PUBLIC_URL}/${key}`,
        });
      })
      .catch((error) => callback(error));
  }

  _removeFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void,
  ) {
    deleteUploadedFile(file.path)
      .then(() => callback(null))
      .catch((error) => callback(error));
  }
}

export function multerStorageOptions({
  destination,
  extensions,
}: Params): StorageEngine {
  return new R2StorageEngine(destination, extensions);
}

export async function deleteUploadedFile(url: string): Promise<void> {
  if (!url) return;

  const key = url.replace(`${R2_PUBLIC_URL}/`, "");
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
  );
}
