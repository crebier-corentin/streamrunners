import { InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Repository } from 'typeorm';

export abstract class EntityService<T> {
    public constructor(protected readonly repo: Repository<T>) {}

    public byId(id: number, relations: string[] = []): Promise<T | undefined> {
        return this.repo.findOne(id, { relations });
    }

    public async byIdOrFail(
        id: number,
        relations: string[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<T> {
        const entity = await this.byId(id, relations);
        if (entity == undefined) throw exception;

        return entity;
    }

    public save(entity: T): Promise<T> {
        return this.repo.save(entity);
    }

    public remove(entity: T): Promise<T> {
        return this.repo.remove(entity);
    }

    public count(): Promise<number> {
        return this.repo.count();
    }

    public all(): Promise<T[]> {
        return this.repo.find();
    }
}
