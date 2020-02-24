import {Controller, Get, Render} from '@nestjs/common';
import * as moment from "moment";
import {UserService} from "../user/user.service";

@Controller('leaderboard')
export class LeaderboardController {

    public constructor(private readonly userService: UserService) {
    }

    @Get()
    @Render('leaderboard')
    public async index(): Promise<{ all: any; week: any; month: any; year: any; day: any }> {

        const date = moment();
        const [day, week, month, year, all] = await Promise.all([
            this.userService.mostPlace(date.startOf("day")), //day
            this.userService.mostPlace(date.startOf("isoWeek")), //week
            this.userService.mostPlace(date.startOf("month")), //month
            this.userService.mostPlace(date.startOf("year")), //year
            this.userService.mostPlace(), //all
        ]);

        return {day, week, month, year, all};

    }
}
