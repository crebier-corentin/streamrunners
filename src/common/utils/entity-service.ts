import { InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Repository } from 'typeorm';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { SaveOptions } from 'typeorm/repository/SaveOptions';

/**
 * Generic service for an entity.
 *
 * Example:
 * ```typescript
 * //In some module
 * imports: [TypeOrmModule.forFeature([ExampleEntity])],
 *
 * //In some service
 * class ExampleService extends EntityService<ExampleEntity> {
 *     public constructor(@InjectRepository(ExampleEntity) repo: Repository<ExampleEntity>) {
 *         super(repo);
 *     }
 * }
 * ```
 */
export abstract class EntityService<T> {
    /**
     * You can use InjectRepository() to get the repository.
     * @param repo Typeorm repository for entity.
     */
    public constructor(protected readonly repo: Repository<T>) {}

    /**
     *
     * @param id Searched id.
     * @param relations Relations to load.
     *
     * @returns The entity with the searched id or undefined if not found.
     */
    public byId(id: number, relations: (keyof T)[] = []): Promise<T | undefined> {
        return this.repo.findOne(id, { relations: relations as string[] });
    }

    /**
     *
     * Throws if entity is not found.
     *
     * @param id Searched id.
     * @param relations Relations to load.
     * @param exception Exception to throw if entity is not found.
     *
     * @returns The entity with the searched id.
     */
    public async byIdOrFail(
        id: number,
        relations: (keyof T)[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<T> {
        const entity = await this.byId(id, relations);
        if (entity == undefined) throw exception;

        return entity;
    }

    /**
     *
     * Save an entity.
     *
     * @param entity Entity to save.
     * @param options Save options to pass to typeorm.
     */
    public save(entity: T, options?: SaveOptions): Promise<T> {
        return this.repo.save(entity, options);
    }

    /**
     * Remove an entity.
     *
     * @param entity Entity to remove.
     * @param options Remove options to pass to typeorm.
     */
    public remove(entity: T, options?: RemoveOptions): Promise<T> {
        return this.repo.remove(entity, options);
    }

    /**
     * @returns The number of row in the table.
     */
    public count(): Promise<number> {
        return this.repo.count();
    }

    /**
     * @returns Every row of the table.
     */
    public all(): Promise<T[]> {
        return this.repo.find();
    }
}
