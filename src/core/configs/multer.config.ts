import {diskStorage} from "multer";
import {join} from 'path'
import * as fs from "node:fs";

interface Params {
    destination: string,
    extensions: string[]
}

export function multerStorageOptions({destination, extensions}: Params) {
    return diskStorage({
        destination: (req, file, callback) => {
            const uploadPath = join(process.cwd(), 'uploads', destination)

            fs.mkdir(uploadPath, {recursive: true}, err => {
                if (err) {
                    return callback(err, '')
                }

                callback(null, uploadPath)
            })
        },
        filename: (req, file, callback) => {
            const extension = file.originalname.split('.').at(-1)

            if (!extension || !extensions.includes(extension.toLowerCase())) {
                return callback(new Error('This extension is not allowed.'), '')
            }

            const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;

            callback(null, fileName)
        }
    })
}