import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../../common/utils/entity-service';
import { SteamKeyCategoryEntity } from './steam-key-category.entity';

/**
 * Entity service for [[SteamKeyCategoryService]].
 *
 * @category Service
 *
 */
@Injectable()
export class SteamKeyCategoryService extends EntityService<SteamKeyCategoryEntity> {
    public constructor(@InjectRepository(SteamKeyCategoryEntity) repo) {
        super(repo);
    }

    /**
     *
     * @param name Name of the searched category.
     * @param relations Relations to load.
     *
     * @returns The matched category or undefined if not found.
     */
    public byName(
        name: string,
        relations: (keyof SteamKeyCategoryEntity)[] = []
    ): Promise<SteamKeyCategoryEntity | undefined> {
        return this.repo.findOne({ where: { name }, relations });
    }

    /**
     *
     * Throws when no match found.
     *
     * @param name Name of the searched category.
     * @param relations Relations to load.
     * @param exception Exception to throw when no match found.
     *
     * @returns The matched category.
     */
    public async byNameOrFail(
        name: string,
        relations: (keyof SteamKeyCategoryEntity)[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<SteamKeyCategoryEntity> {
        const entity = await this.byName(name, relations);
        if (entity == undefined) throw exception;

        return entity;
    }

    /**
     * @returns All category names.
     */
    public async allCategoriesNames(): Promise<string[]> {
        return (await this.repo.find({ select: ['name'] })).map(c => c.name);
    }
}
