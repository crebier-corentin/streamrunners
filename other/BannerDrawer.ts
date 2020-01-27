import {createCanvas, Image, loadImage} from "canvas";
import {User} from "../database/entity/User";
import {duplicatedArray} from "./utils";
import * as fs from "fs";
import * as path from "path";

export class BannerDrawer {

    private static cache: Buffer;

    public static async loadDefaultBanner() {
       BannerDrawer.cache = await fs.promises.readFile(path.join(__dirname, "../public/img/photo-wall.png"))
    }

    private static async pickAvatars(count: number): Promise<Image[]> {
        const users = await User.createQueryBuilder("user")
            .select("user.avatar")
            .orderBy("RAND()")
            .limit(count)
            .getMany();

        const avatars: Image[] = [];
        for (const user of users) {
            try {
                avatars.push(await loadImage(user.avatar));
            }
            catch {
                //Ignore
            }
        }

        return avatars;
    };

    private static async drawBanner(columns: number, rows: number, avatars: Image[]): Promise<Buffer> {
        const canvas = createCanvas(columns * 100, rows * 100);
        const ctx = canvas.getContext("2d");

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {

                const image = avatars[y * columns + x];
                ctx.drawImage(image, x * 100, y * 100, 100, 100)
            }
        }

        return canvas.toBuffer('image/png');
    };

    public static async updateBanner(): Promise<void> {
        const columnCount = 10;
        const rowsCount = 5;
        const tileCount = columnCount * rowsCount;

        let avatars = await BannerDrawer.pickAvatars(tileCount);
        //Do nothing if not enough avatars
        if (avatars.length <= 1) return;

        //Duplicate list if needed
        if (avatars.length < tileCount) {
            const dupAmount = Math.ceil(tileCount / avatars.length);
            avatars = duplicatedArray(avatars, dupAmount);
        }

        BannerDrawer.cache = await BannerDrawer.drawBanner(columnCount, rowsCount, avatars);
    }

    public static getBanner() {
        return BannerDrawer.cache;
    }

}
