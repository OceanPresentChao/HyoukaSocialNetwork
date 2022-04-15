import { readJsonFile, writeJsonFile } from "./tools"
import * as graphlib from 'graphlib';
import type { Edge, Graph } from "graphlib";
const peopleCategory = JSON.parse(readJsonFile("./public/peopleCategory.json"));
const peopleMap = new Map<string, People>();
interface People {
    name: string
    id: string
    value: number
    category: number
}
export function integratePeople() {
    for (const [key, value] of Object.entries(peopleCategory)) {
        const p: People = value! as People;
        const newpeople: People = {
            name: key,
            id: key,
            value: 0,
            category: p.category as number
        }
        peopleMap.set(key, newpeople);
    }

    for (let i = 1; i <= 4; i++) {
        const peopleCnt = JSON.parse(readJsonFile(`./public/peopleCnt第${i}卷.json`));
        for (const [key, value] of Object.entries(peopleCnt)) {
            if (peopleMap.has(key)) {
                peopleMap.get(key)!.value += value as number;
            }
        }
    }
    writeJsonFile("./results/people.json", JSON.stringify(Object.fromEntries(peopleMap.entries())));
}

export function buildGraph(): Graph {
    const G = new graphlib.Graph({ directed: true, compound: false, multigraph: false });
    const people = JSON.parse(readJsonFile("./results/people.json"));
    for (const [key, value] of Object.entries(people)) {
        G.setNode(key, value)
    }
    interface JsonNode {
        node1: string
        node2: string
        weight: number
    }
    for (let i = 1; i <= 4; i++) {
        let filename = `./public/社交网络第${i}卷`;
        if (i !== 3) {
            const connection: Array<JsonNode> = JSON.parse(readJsonFile(filename + ".json"));
            for (const item of connection) {
                if (G.hasEdge(item.node1, item.node2) || G.hasEdge(item.node2, item.node1)) {
                    const val = G.edge(item.node1, item.node2);
                    G.setEdge(item.node1, item.node2, item.weight + val);
                    G.setEdge(item.node2, item.node1, item.weight + val);
                } else {
                    G.setEdge(item.node1, item.node2, item.weight);
                    G.setEdge(item.node2, item.node1, item.weight);
                }

            }
        } else {
            const iter = ["奉太郎", "里志", "摩耶花", "千反田"];
            for (const per of iter) {
                const connection: Array<JsonNode> = JSON.parse(readJsonFile(filename + per + ".json"));
                for (const item of connection) {
                    if (G.hasEdge(item.node1, item.node2) || G.hasEdge(item.node2, item.node1)) {
                        const val = G.edge(item.node1, item.node2);
                        G.setEdge(item.node1, item.node2, item.weight + val);
                        G.setEdge(item.node2, item.node1, item.weight + val);
                    } else {
                        G.setEdge(item.node1, item.node2, item.weight);
                        G.setEdge(item.node2, item.node1, item.weight);
                    }
                }
            }
        }
    }
    writeJsonFile("./results/Graph.json", JSON.stringify(graphlib.json.write(G)));
    return G;
}

export function getGraph(): Graph {
    const fileData = readJsonFile("./results/Graph.json");
    return graphlib.json.read(JSON.parse(fileData));
}
interface NodePath {
    distance: number
    path: Array<string>
}

interface PathResult {
    [target: string]: NodePath
}
export function getAllShortestPath(graph: Graph, source: string,
    weightFn?: (e: Edge) => number,
    edgeFn?: (v: string) => Edge[]) {
    const dijsktraRes = graphlib.alg.dijkstra(graph, source, weightFn, edgeFn);
    const result: PathResult = {};
    for (const [key, value] of Object.entries(dijsktraRes)) {
        if (!value.predecessor) {
            const nodepath: NodePath = { distance: value.distance, path: [] };
            result[key] = nodepath;
            continue;
        }
        const nodepath: NodePath = { distance: value.distance, path: [key] };
        let pre = value.predecessor;
        while (pre !== source) {
            nodepath.path.push(pre);
            pre = dijsktraRes[pre]!.predecessor;
        }
        nodepath.path.push(source);
        nodepath.path.reverse();
        result[key] = nodepath;
    }
    return result;
}

export function pageRank(graph: Graph, d: number = 0.85, maxerr: number = 0.0001, maxcount = 100) {
    interface NIMap {
        [name: string]: number
    }
    const name2id: NIMap = {};
    let PRold: Array<number> = [];
    let PRnew: Array<number> = [];
    let pcount = 0;
    for (let node of graph.nodes()) {
        name2id[node] = pcount++;
        PRold.push(Math.log10(graph.node(node).value! + 1));
    }
    let iteCount = 1;
    let err = 0x3f3f3f3f;
    const calErr = () => {
        let err = 0;
        for (let i = 0; i < PRnew.length; i++) {
            err += (PRnew[i]! - PRold[i]!)
        }
        return Math.abs(err);
    }
    while (err > maxerr && iteCount < maxcount) {
        for (let node of graph.nodes()) {
            let pr = (1 - d) * PRold[name2id[node]!]!;
            const inNodes = graph.predecessors(node) as string[];
            for (let item of inNodes) {
                if (graph.hasEdge(item, node)) {
                    pr += d * graph.edge(item, node) as number / graph.outEdges(item)!.length;
                }
            }
            PRnew[name2id[node]!]! = pr;
        }
        iteCount++;
        err = calErr();
        PRold = Array.from(PRnew);
    }
    const result = [];
    for (let i = 0; i < PRnew.length; i++) {
        result.push({ PR: PRnew[i], name: graph.nodes()[i] });
    }
    writeJsonFile("./results/pagerank.json", JSON.stringify(result));
}

// function weight(e: any) {
//     return Number(Number(1 / G.edge(e) * 1000).toFixed(4));
// }