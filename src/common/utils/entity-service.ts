import { InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Repository } from 'typeorm';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { SaveOptions } from 'typeorm/repository/SaveOptions';

export abstract class EntityService<T> {
    public constructor(protected readonly repo: Repository<T>) {}

    public byId(id: number, relations: (keyof T)[] = []): Promise<T | undefined> {
        return this.repo.findOne(id, { relations: relations as string[] });
    }

    public async byIdOrFail(
        id: number,
        relations: (keyof T)[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<T> {
        const entity = await this.byId(id, relations);
        if (entity == undefined) throw exception;

        return entity;
    }

    public save(entity: T, options?: SaveOptions): Promise<T> {
        return this.repo.save(entity, options);
    }

    public remove(entity: T, options?: RemoveOptions): Promise<T> {
        return this.repo.remove(entity, options);
    }

    public count(): Promise<number> {
        return this.repo.count();
    }

    public all(): Promise<T[]> {
        return this.repo.find();
    }
}
