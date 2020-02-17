import { InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Repository } from 'typeorm';

export abstract class EntityService<T> {
    constructor(protected readonly repo: Repository<T>) {}

    public byId(id: number): Promise<T | undefined> {
        return this.repo.findOne(id);
    }

    public async byIdOrFail(id: number, exception: HttpException = new InternalServerErrorException()): Promise<T> {
        const entity = await this.byId(id);
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
}
