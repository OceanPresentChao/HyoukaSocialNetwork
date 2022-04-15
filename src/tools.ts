import axios from 'axios';
import * as fs from 'fs';
/*
aid：视频av号，如：https://www.bilibili.com/video/av93987817，其中av后面的数字即视频的av号。
media_id：番剧md号，如：https://www.bilibili.com/bangumi/media/md28229233，其中md后面的数字即番剧的md号。
season_id：番剧ss号，如：https://www.bilibili.com/bangumi/play/ss33802，其中ss后面的数字即番剧的ss号。
ep：番剧视频id号，如：https://www.bilibili.com/bangumi/play/ep330798，其中ep后面的数字即番剧的单集编号。
cid：番剧视频弹幕池id号。
*/
export function ss2aid_bangumi(ssid: string) {
    return new Promise(async (resolve) => {
        let res = await axios({
            url: `https://api.bilibili.com/pgc/web/season/section?season_id=${ssid}`,
            method: "GET"
        })
        let episodes = res.data.result.main_section.episodes;
        let jsondata = [];
        for (let episode of episodes) {
            let newnode = { title: episode.long_title, aid: episode.aid }
            jsondata.push(newnode);
        }
        resolve(jsondata);
    });

}

export function getHotReplies(aid: string, startPage: number, endPage: number) {
    return new Promise(async (resolve) => {
        let result = [];
        for (let i = startPage; i <= endPage; i++) {
            let res = await axios({
                url: `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&pn=${i}`,
                method: "GET"
            })
            let pageResult = [];
            let hots = res.data.data.hots;
            for (let hot of hots) {
                let tmpresult = [];
                let replies = hot.replies;
                for (let reply of replies) {
                    tmpresult.push({ like: reply.like, sex: reply.member.sex, content: reply.content.message });
                }
                pageResult.push({ like: hot.like, sex: hot.member.sex, content: hot.content.message, replies: tmpresult })
            }
            result.push(pageResult);
        }
        resolve(result);
    });
}

export function readJsonFile(inputfile: string): string {
    const fileData = fs.readFileSync(inputfile, { encoding: "utf-8", flag: "r+" });
    return fileData;
}

export function writeJsonFile(outputfile: string, data: string) {
    fs.writeFileSync(outputfile, data, { flag: "w+", encoding: "utf-8" });
}