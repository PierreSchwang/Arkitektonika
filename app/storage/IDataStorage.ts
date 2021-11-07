import {SchematicRecord} from "../model/SchematicRecord";

export default interface IDataStorage {

    getAllRecords(): Promise<SchematicRecord[]>;

    /**
     * Retrieve a {@link SchematicRecord} from the current data storage implementation by its download key.
     *
     * @param   downloadKey The download key to search for
     * @return  Promise either containing the found {@link SchematicRecord} or
     *          a failed promise of none found matching the download key.
     */
    getSchematicRecordByDownloadKey(downloadKey: string): Promise<SchematicRecord>;

    /**
     * Retrieve a {@link SchematicRecord} from the current data storage implementation by its delete key.
     *
     * @param   deleteKey The delete key to search for
     * @return  Promise either containing the found {@link SchematicRecord} or
     *          a failed promise of none found matching the delete key.
     */
    getSchematicRecordByDeleteKey(deleteKey: string): Promise<SchematicRecord>;

    /**
     * Delete a schematic from the database
     * @param recordId
     */
    deleteSchematicRecord(recordId: number): Promise<any>;

    /**
     *
     * @param record
     */
    storeSchematicRecord(record: SchematicRecord): Promise<SchematicRecord>;

    /**
     * Deletes expired schematics based on {@link SchematicRecord#last_accessed} is further than x milliseconds ago.
     * @param milliseconds  The amount of milliseconds to check last_accessed against.
     * @return              Promise either containing the deleted rows or
     *                      a failed promise if something went wrong.
     */
    deleteExpiredSchematicRecords(milliseconds: number): Promise<SchematicRecord[]>;

    generateDownloadKey(maxIterations: number): Promise<string>;

    generateDeletionKey(maxIterations: number): Promise<string>;

}