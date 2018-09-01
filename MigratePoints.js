import {createConnection} from "typeorm";
import {User} from "./database/entity/User";

(async () => {
        await createConnection();

        let users = await User.find();

        for (const user of users) {
            user.points = await user.pointsFunc();
            await user.save();
        }
    }
)();