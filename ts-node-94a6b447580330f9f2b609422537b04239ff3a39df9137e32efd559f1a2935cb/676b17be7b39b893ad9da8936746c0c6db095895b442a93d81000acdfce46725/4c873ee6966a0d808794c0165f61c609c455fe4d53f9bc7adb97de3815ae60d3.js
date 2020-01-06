"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const crypto = require("crypto");
function getDBConnection() {
    let repository;
    if (process.env.NODE_ENV === "test") {
        repository = typeorm_1.getConnection("test");
    }
    else {
        repository = typeorm_1.getConnection();
    }
    return repository;
}
exports.getDBConnection = getDBConnection;
function randomString(n = 20) {
    return crypto.randomBytes(n).toString('hex');
}
exports.randomString = randomString;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9jb25uZWN0aW9uLnRzIiwic291cmNlcyI6WyIvU3RyZWFtUnVubmVycy9Ud2l0Y2hWaWV3L2RhdGFiYXNlL2Nvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBa0Q7QUFDbEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLFNBQWdCLGVBQWU7SUFDM0IsSUFBSSxVQUFzQixDQUFDO0lBRTNCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1FBQ2pDLFVBQVUsR0FBRyx1QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3RDO1NBQ0k7UUFDRCxVQUFVLEdBQUcsdUJBQWEsRUFBRSxDQUFDO0tBQ2hDO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQztBQVhELDBDQVdDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQVksRUFBRTtJQUN2QyxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFGRCxvQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29ubmVjdGlvbiwgZ2V0Q29ubmVjdGlvbn0gZnJvbSBcInR5cGVvcm1cIjtcbmNvbnN0IGNyeXB0byA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREQkNvbm5lY3Rpb24oKSB7XG4gICAgbGV0IHJlcG9zaXRvcnk6IENvbm5lY3Rpb247XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwidGVzdFwiKSB7XG4gICAgICAgIHJlcG9zaXRvcnkgPSBnZXRDb25uZWN0aW9uKFwidGVzdFwiKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJlcG9zaXRvcnkgPSBnZXRDb25uZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcG9zaXRvcnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21TdHJpbmcobjogbnVtYmVyID0gMjApIHtcbiAgICByZXR1cm4gY3J5cHRvLnJhbmRvbUJ5dGVzKG4pLnRvU3RyaW5nKCdoZXgnKTtcbn0iXX0=