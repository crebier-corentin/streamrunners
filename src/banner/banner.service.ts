import * as fs from 'fs';
import * as path from 'path';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createCanvas, Image, loadImage } from 'canvas';
import { UserService } from '../user/user.service';
import { duplicatedArray } from '../utils/utils';

@Injectable()
export class BannerService implements OnApplicationBootstrap {
    public constructor(private readonly userService: UserService) {}

    private cache: Buffer;

    public async onApplicationBootstrap(): Promise<void> {
        await this.loadDefaultBanner();
        await this.updateBanner();
    }

    public async loadDefaultBanner(): Promise<void> {
        this.cache = await fs.promises.readFile(path.join(__dirname, '../../public/img/photo-wall.png'));
    }

    private async pickAvatars(count: number): Promise<Image[]> {
        const users = await this.userService.pickRandomNonDefaultAvatars(count);

        const avatars: Image[] = [];
        for (const user of users) {
            try {
                avatars.push(await loadImage(user.avatar));
            } catch {
                //Ignore
            }
        }

        return avatars;
    }

    private drawBanner(columns: number, rows: number, avatars: Image[]): Buffer {
        const canvas = createCanvas(columns * 100, rows * 100);
        const ctx = canvas.getContext('2d');

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                const image = avatars[y * columns + x];
                ctx.drawImage(image, x * 100, y * 100, 100, 100);
            }
        }

        return canvas.toBuffer('image/png');
    }

    @Cron(CronExpression.EVERY_MINUTE)
    public async updateBanner(): Promise<void> {
        const columnCount = 10;
        const rowsCount = 5;
        const tileCount = columnCount * rowsCount;

        let avatars = await this.pickAvatars(tileCount);
        //Do nothing if not enough avatars
        if (avatars.length <= 1) return;

        //Duplicate list if needed
        if (avatars.length < tileCount) {
            const dupAmount = Math.ceil(tileCount / avatars.length);
            avatars = duplicatedArray(avatars, dupAmount);
        }

        this.cache = await this.drawBanner(columnCount, rowsCount, avatars);
    }

    public getBanner(): Buffer {
        return this.cache;
    }
}
