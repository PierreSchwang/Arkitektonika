import express from "express";
import fileUpload, {UploadedFile} from 'express-fileupload';
import Arkitektonika, {SCHEMATIC_DIR} from "../../Arkitektonika";
import nbt from "prismarine-nbt";
import * as fs from "fs";
import path from "path";

const UPLOAD_OPTIONS: fileUpload.Options = {
    abortOnLimit: true,
    useTempFiles: true,
    preserveExtension: ("schematic".length),
    createParentPath: true,
    safeFileNames: true,
    limits: {},
    uploadTimeout: 1000 * 15
};
export const UPLOAD_ROUTER = (app: Arkitektonika, router: express.Application) => {

    router.post('/upload', fileUpload(UPLOAD_OPTIONS), (async (req, res) => {
        const file = req.files?.schematic as UploadedFile;

        // check if request contains file
        if (!file) {
            return res.status(400).send({
                error: 'Missing file'
            });
        }

        // Validate nbt file
        try {
            await nbt.parse(fs.readFileSync(file.tempFilePath));
        } catch (error) {
            app.logger.debug('Invalid request due to invalid nbt content');
            fs.unlinkSync(file.tempFilePath);
            return res.status(400).send({
                error: 'File is not valid NBT'
            });
        }

        // Generate keys
        let downloadKey, deletionKey;
        try {
            downloadKey = await app.dataStorage.generateDownloadKey(app.config.maxIterations);
            deletionKey = await app.dataStorage.generateDeletionKey(app.config.maxIterations);
        } catch (error) {
            fs.unlinkSync(file.tempFilePath);
            return res.status(500).send({
                error: 'Failed to generate download and / or deletion key'
            });
        }

        // Insert record into accounting table
        try {
            const record = await app.dataStorage.storeSchematicRecord({
                expired: false,
                downloadKey, deleteKey: deletionKey,
                fileName: file.name
            });
            await file.mv(path.join(SCHEMATIC_DIR, downloadKey))
            res.status(200).send({
                download_key: record.downloadKey,
                delete_key: record.deleteKey
            });
        } catch (error) {
            fs.unlinkSync(file.tempFilePath);
            return res.status(500).send({
                error: 'Failed to persist data in table'
            });
        }
    }));

    return router;
}