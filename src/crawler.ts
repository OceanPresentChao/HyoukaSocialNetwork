import axios from 'axios';
import * as fs from 'fs';
import * as jieba from '@node-rs/jieba';

const dir = fs.readdirSync("./comments", { encoding: "utf-8" });
const wordmap = new Map<string, number>();
function readHotComments() {
    for (let file of dir) {
        if (/^HyoukaComment/.test(file)) {
            const json = fs.readFileSync("./comments/" + file, { encoding: "utf-8", flag: "r" });
            const data = JSON.parse(json);
            const comments = data[0];
            for (const comment of comments) {
                const words = jieba.extract(comment.content, 5);
                for (let word of words) {
                    if (wordmap.has(word.keyword)) {
                        const val = wordmap.get(word.keyword);
                        wordmap.set(word.keyword, val! + word.weight);
                    }
                    else {
                        wordmap.set(word.keyword, word.weight);
                    }
                }
            }
        }
    }
}

async function readShortComments() {
    let commentpage = 0;
    for (let i = 0; i < 10; i++) {
        let url = `https://api.bilibili.com/pgc/review/short/list?media_id=3398&ps=30&sort=0`;
        if (commentpage) {
            url += `&cursor=${commentpage}`;
        }
        const data = await axios({
            url,
            method: "GET"
        })
        const response = data.data.data;
        commentpage = response.next;
        for (let comment of response.list) {
            if (String(comment.content).length < 10) { continue; }
            const words = jieba.extract(comment.content, 3);
            for (let word of words) {
                if (wordmap.has(word.keyword)) {
                    const val = wordmap.get(word.keyword);
                    wordmap.set(word.keyword, val! + word.weight);
                }
                else {
                    wordmap.set(word.keyword, word.weight);
                }
            }
        }
    }
    fs.writeFileSync("./results/comments.json", JSON.stringify(Object.fromEntries(wordmap.entries())), { encoding: "utf-8", flag: "w+" });
}

function saveArray() {
    const data = JSON.parse(fs.readFileSync("./results/comments.json", { encoding: "utf-8", flag: "r+" })) as Object;
    const arr: Array<any> = [];
    for (const [key, value] of Object.entries(data)) {
        arr.push({ word: key, value: value })
    }
    arr.sort((a, b) => b.value - a.value);
    fs.writeFileSync("./results/commentsArr.json", JSON.stringify(arr), { encoding: "utf-8", flag: "w+" });
}
saveArray();