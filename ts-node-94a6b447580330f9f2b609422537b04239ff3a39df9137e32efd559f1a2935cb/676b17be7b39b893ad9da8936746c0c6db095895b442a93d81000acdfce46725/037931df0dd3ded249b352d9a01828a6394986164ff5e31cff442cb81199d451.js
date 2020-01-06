"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class RemoveEmail1568048493734 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `user` DROP COLUMN `email`");
            yield queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL");
            yield queryRunner.query("ALTER TABLE `coupon` CHANGE `expires` `expires` datetime NOT NULL");
            yield queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `lastUpdate` `lastUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
            yield queryRunner.query("ALTER TABLE `vip` CHANGE `start` `start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
            yield queryRunner.query("ALTER TABLE `vip` CHANGE `last` `last` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query("ALTER TABLE `vip` CHANGE `last` `last` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
            yield queryRunner.query("ALTER TABLE `vip` CHANGE `start` `start` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
            yield queryRunner.query("ALTER TABLE `user` CHANGE `lastUpdate` `lastUpdate` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
            yield queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime(0) NULL");
            yield queryRunner.query("ALTER TABLE `coupon` CHANGE `expires` `expires` datetime(0) NOT NULL");
            yield queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime(0) NULL");
            yield queryRunner.query("ALTER TABLE `user` ADD `email` varchar(255) NOT NULL");
        });
    }
}
exports.RemoveEmail1568048493734 = RemoveEmail1568048493734;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9taWdyYXRpb24vMTU2ODA0ODQ5MzczNC1SZW1vdmVFbWFpbC50cyIsInNvdXJjZXMiOlsiL1N0cmVhbVJ1bm5lcnMvVHdpdGNoVmlldy9kYXRhYmFzZS9taWdyYXRpb24vMTU2ODA0ODQ5MzczNC1SZW1vdmVFbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRUEsTUFBYSx3QkFBd0I7SUFFcEIsRUFBRSxDQUFDLFdBQXdCOztZQUNwQyxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUNsRSxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsaUVBQWlFLENBQUMsQ0FBQztZQUMzRixNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQztZQUM3RixNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQztZQUM3RixNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsaUdBQWlHLENBQUMsQ0FBQztZQUMzSCxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsc0ZBQXNGLENBQUMsQ0FBQztZQUNoSCxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0ZBQW9GLENBQUMsQ0FBQztRQUNsSCxDQUFDO0tBQUE7SUFFWSxJQUFJLENBQUMsV0FBd0I7O1lBQ3RDLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyx1RkFBdUYsQ0FBQyxDQUFDO1lBQ2pILE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyx5RkFBeUYsQ0FBQyxDQUFDO1lBQ25ILE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxvR0FBb0csQ0FBQyxDQUFDO1lBQzlILE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7S0FBQTtDQUVKO0FBdEJELDREQXNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWlncmF0aW9uSW50ZXJmYWNlLCBRdWVyeVJ1bm5lcn0gZnJvbSBcInR5cGVvcm1cIjtcblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVtYWlsMTU2ODA0ODQ5MzczNCBpbXBsZW1lbnRzIE1pZ3JhdGlvbkludGVyZmFjZSB7XG5cbiAgICBwdWJsaWMgYXN5bmMgdXAocXVlcnlSdW5uZXI6IFF1ZXJ5UnVubmVyKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgdXNlcmAgRFJPUCBDT0xVTU4gYGVtYWlsYFwiKTtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgc3RyZWFtX3F1ZXVlYCBDSEFOR0UgYHN0YXJ0YCBgc3RhcnRgIGRhdGV0aW1lIE5VTExcIik7XG4gICAgICAgIGF3YWl0IHF1ZXJ5UnVubmVyLnF1ZXJ5KFwiQUxURVIgVEFCTEUgYGNvdXBvbmAgQ0hBTkdFIGBleHBpcmVzYCBgZXhwaXJlc2AgZGF0ZXRpbWUgTk9UIE5VTExcIik7XG4gICAgICAgIGF3YWl0IHF1ZXJ5UnVubmVyLnF1ZXJ5KFwiQUxURVIgVEFCTEUgYHVzZXJfcG93ZXJgIENIQU5HRSBgZXhwaXJlc2AgYGV4cGlyZXNgIGRhdGV0aW1lIE5VTExcIik7XG4gICAgICAgIGF3YWl0IHF1ZXJ5UnVubmVyLnF1ZXJ5KFwiQUxURVIgVEFCTEUgYHVzZXJgIENIQU5HRSBgbGFzdFVwZGF0ZWAgYGxhc3RVcGRhdGVgIGRhdGV0aW1lIE5PVCBOVUxMIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcIik7XG4gICAgICAgIGF3YWl0IHF1ZXJ5UnVubmVyLnF1ZXJ5KFwiQUxURVIgVEFCTEUgYHZpcGAgQ0hBTkdFIGBzdGFydGAgYHN0YXJ0YCBkYXRldGltZSBOT1QgTlVMTCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXCIpO1xuICAgICAgICBhd2FpdCBxdWVyeVJ1bm5lci5xdWVyeShcIkFMVEVSIFRBQkxFIGB2aXBgIENIQU5HRSBgbGFzdGAgYGxhc3RgIGRhdGV0aW1lIE5PVCBOVUxMIERFRkFVTFQgQ1VSUkVOVF9USU1FU1RBTVBcIik7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGRvd24ocXVlcnlSdW5uZXI6IFF1ZXJ5UnVubmVyKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgdmlwYCBDSEFOR0UgYGxhc3RgIGBsYXN0YCBkYXRldGltZSgwKSBOT1QgTlVMTCBERUZBVUxUIENVUlJFTlRfVElNRVNUQU1QXCIpO1xuICAgICAgICBhd2FpdCBxdWVyeVJ1bm5lci5xdWVyeShcIkFMVEVSIFRBQkxFIGB2aXBgIENIQU5HRSBgc3RhcnRgIGBzdGFydGAgZGF0ZXRpbWUoMCkgTk9UIE5VTEwgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUFwiKTtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgdXNlcmAgQ0hBTkdFIGBsYXN0VXBkYXRlYCBgbGFzdFVwZGF0ZWAgZGF0ZXRpbWUoMCkgTk9UIE5VTEwgREVGQVVMVCBDVVJSRU5UX1RJTUVTVEFNUFwiKTtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgdXNlcl9wb3dlcmAgQ0hBTkdFIGBleHBpcmVzYCBgZXhwaXJlc2AgZGF0ZXRpbWUoMCkgTlVMTFwiKTtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgY291cG9uYCBDSEFOR0UgYGV4cGlyZXNgIGBleHBpcmVzYCBkYXRldGltZSgwKSBOT1QgTlVMTFwiKTtcbiAgICAgICAgYXdhaXQgcXVlcnlSdW5uZXIucXVlcnkoXCJBTFRFUiBUQUJMRSBgc3RyZWFtX3F1ZXVlYCBDSEFOR0UgYHN0YXJ0YCBgc3RhcnRgIGRhdGV0aW1lKDApIE5VTExcIik7XG4gICAgICAgIGF3YWl0IHF1ZXJ5UnVubmVyLnF1ZXJ5KFwiQUxURVIgVEFCTEUgYHVzZXJgIEFERCBgZW1haWxgIHZhcmNoYXIoMjU1KSBOT1QgTlVMTFwiKTtcbiAgICB9XG5cbn1cbiJdfQ==