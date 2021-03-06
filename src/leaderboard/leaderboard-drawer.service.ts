import * as fs from 'fs';
import * as path from 'path';
import { forwardRef, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { createCanvas, Image, loadImage, registerFont } from 'canvas';
import * as moment from 'moment';
import CacheService from '../common/utils/cache-service';
import { PUBLIC_DIR_PATH } from '../common/utils/constants';
import { MostPlaceResult } from '../user/most-place-result.interface';
import { UserService } from '../user/user.service';

/**
 * Service taking care of generating leaderboard images for the discord bot and the site.
 *
 * @category Service
 *
 */
@Injectable()
export class LeaderboardDrawerService implements OnApplicationBootstrap {
    private cache = new CacheService(5);

    private readonly width = 500;
    private readonly height = 800;

    private readonly bigTextSize = 50;
    private readonly smallTextSize = 30;

    private readonly bigTextLineHeight = Math.round(this.bigTextSize * 1.1);
    private readonly smallTextLineHeight = Math.round(this.smallTextSize * 1.5);

    private footerLogoImage: Image;
    private backgroundImage: Image;
    private firstTrophyImage: Image;
    private secondTrophyImage: Image;
    private thirdTrophyImage: Image;

    public constructor(@Inject(forwardRef(() => UserService)) private readonly userService: UserService) {}

    public async onApplicationBootstrap(): Promise<void> {
        [
            this.footerLogoImage,
            this.backgroundImage,
            this.firstTrophyImage,
            this.secondTrophyImage,
            this.thirdTrophyImage,
        ] = await Promise.all([
            loadImage(fs.readFileSync(path.join(PUBLIC_DIR_PATH, 'img/earth.svg'))), //footerLogoImage
            loadImage(fs.readFileSync(path.join(PUBLIC_DIR_PATH, 'img/leaderboard/background.png'))), //backgroundImage
            loadImage(fs.readFileSync(path.join(PUBLIC_DIR_PATH, 'img/leaderboard/Coupe_or.svg'))), //firstTrophyImage
            loadImage(fs.readFileSync(path.join(PUBLIC_DIR_PATH, 'img/leaderboard/Coupe_argent.svg'))), //secondTrophyImage
            loadImage(fs.readFileSync(path.join(PUBLIC_DIR_PATH, 'img/leaderboard/Coupe_bronze.svg'))), //thirdTrophyImage
        ]);

        registerFont(path.join(PUBLIC_DIR_PATH, 'font/dosis/Dosis-Bold.ttf'), { family: 'Dosis', weight: 'bold' });
    }

    /**
     * Generates a leaderboard image.
     *
     * @param users Users to display in the list.
     * @param headerTimeName Name of the header.
     */
    private draw(users: MostPlaceResult[], headerTimeName = ''): Promise<Buffer> {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        //Background
        ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);

        //Header text
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.bigTextSize}px "Dosis"`;
        ctx.textAlign = 'center';
        ctx.fillText('Classement', this.width / 2, this.bigTextLineHeight);
        ctx.fillText('Streamer', this.width / 2, this.bigTextLineHeight * 2);
        //No draw if blank
        if (headerTimeName !== '') ctx.fillText(headerTimeName, this.width / 2, this.bigTextLineHeight * 3);

        //Ranking
        ctx.font = `${this.smallTextSize}px "Dosis"`;
        let y = this.bigTextLineHeight * 5;
        for (let rank = 1; rank <= users.length; rank++) {
            const user = users[rank - 1];

            const leftPadding = 50;

            //Rank
            const drawImageRank = (image: Image): void => {
                ctx.drawImage(
                    image,
                    leftPadding - this.smallTextSize,
                    y - this.smallTextSize,
                    this.smallTextSize,
                    this.smallTextSize
                );
            };

            ctx.textAlign = 'right';
            switch (rank) {
                case 1:
                    drawImageRank(this.firstTrophyImage);
                    break;
                case 2:
                    drawImageRank(this.secondTrophyImage);
                    break;
                case 3:
                    drawImageRank(this.thirdTrophyImage);
                    break;
                default:
                    ctx.fillText(rank.toString(), leftPadding, y);
                    break;
            }

            //Dot
            const dotX = leftPadding + 5;
            ctx.fillText('.', dotX, y);

            //Display name and colon
            ctx.textAlign = 'left';

            const displayNameX = dotX + 5;
            const colonX = displayNameX + 200;

            ctx.fillText(user.displayName, displayNameX, y, colonX - displayNameX);
            ctx.fillText(':', colonX, y);

            //Time
            const timeX = colonX + 20;
            ctx.fillText(`${user.time} secondes`, timeX, y, this.width - timeX);

            //Next row
            y += this.smallTextLineHeight;
        }

        //Footer logo
        ctx.drawImage(this.footerLogoImage, this.width - (64 + 10), this.height - (64 + 10), 64, 64);

        //Promisify canvas.toBuffer
        return new Promise<Buffer>((resolve, reject) => {
            canvas.toBuffer((err, result) => {
                if (err) reject(err);
                else resolve(result);
            }, 'image/png');
        });
    }

    /**
     *
     * @param unitOfTime Unit name to translate.
     *
     * @returns moment.js unit of time to french name.
     */
    private unitOfTimeToFrenchName(unitOfTime: 'day' | 'isoWeek' | 'month' | 'year' | null): string {
        switch (unitOfTime) {
            case 'day':
                return "Aujourd'hui";
            case 'isoWeek':
                return 'Semaine';
            case 'month':
                return 'Mois';
            case 'year':
                return 'Année';
            default:
                return '';
        }
    }

    /**
     *
     * @remark
     * Uses a [[cache]].
     *
     * @param unitOfTime Max range to account for in the leaderboard.
     *
     * @returns PNG buffer leaderboard image.
     */
    public async getLeaderboardFor(
        unitOfTime: 'day' | 'isoWeek' | 'month' | 'year' | null | undefined = null
    ): Promise<Buffer> {
        const startOf = unitOfTime == null ? null : moment().startOf(unitOfTime);
        const users = await this.userService.mostPlace(startOf);

        return this.cache.get(String(unitOfTime), this.draw.bind(this, users, this.unitOfTimeToFrenchName(unitOfTime)));
    }
}
