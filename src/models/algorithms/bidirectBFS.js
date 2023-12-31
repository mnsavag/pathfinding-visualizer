import { Algorithm } from "./algorithm.js"
import { cellStates } from "../cellStates.js"
import { getTempSpeed } from "../menu/speedBtn.js"
import { sleep } from "../../miscellaneous/utility.js"

const notAvailObj = {
    [cellStates.WALL]: true,
    [cellStates.START]: true
}

const colors = {
    ZERO: "0",
    ONE: "1",
    TWO: "2"
}

export class BidirectBFS extends Algorithm {
    static async search(map, sY, sX, fY, fX, height, width) {
        const dx = [0,   1, -1,  0]
        const dy = [-1 , 0,  0, 1]

        let colorMap = getColorMap(width, height)
        let ancestors = {}

        let queue = [[sY, sX, colors.ONE], [fY, fX, colors.TWO]]
        colorMap[sY][sX] = colors.ONE
        colorMap[fY][fX] = colors.TWO

        let intersectionNode
        let intersectionNext
        let isNodeFound = false
        let lastY
        let lastX
        while (queue.length > 0) {
            let [y, x, color] = queue.shift()
            
            map[y][x].animateCellSpawn()
            await sleep(getTempSpeed() - 10)
            
            for (let i = 0; i < dx.length; i++) {
                const [newY, newX] = [y - dy[i], x - dx[i]]
    
                if (0 <= newX && newX < width && 
                    0 <= newY && newY < height &&
                    !(map[newY][newX].DOM.className in notAvailObj)) {
                        if (colorMap[newY][newX] === color) {
                            continue
                        }
                        if (colorMap[newY][newX] === colors.ZERO) {
                            colorMap[newY][newX] = color
                            queue.push([newY, newX, color])
                        }
                        else if (colorMap[newY][newX] !== color) {
                            isNodeFound = true
                            map[newY][newX].animateCellSpawn()
                            await sleep(getTempSpeed() - 10)
                            

                            colorMap[newY][newX] = color
                            intersectionNode = [newY, newX]
                            lastY = y
                            lastX = x

                            intersectionNext = getAdjencentOtherColor(newY, newX, color, colorMap, width, height, map)
                            break
                        }
                        ancestors[[newY, newX]] = [y, x]
                    }
                }
                if (isNodeFound) {
                    break
                }
        }
        
        if (intersectionNode) {
            ancestors[intersectionNode] = [lastY, lastX]
            super.animatePath(map, ancestors, intersectionNode[0], intersectionNode[1])
            ancestors[intersectionNode] = intersectionNext
            await super.animatePath(map, ancestors, intersectionNode[0], intersectionNode[1])
        }
    }
}


function getColorMap(width, height) {
    let map = []
    for (let i = 0; i < height; i++) {
        let row = []
        for (let j = 0; j < width; j++) {
            row.push(colors.ZERO)
        }
        map.push(row)
    }
    return map
}

function getAdjencentOtherColor(y, x, color, colorMap, width, height, map) {
    const dx = [0,   1, -1,  0]
    const dy = [-1 , 0,  0, 1]
    for (let i = 0; i < dx.length; i++) {
        const [newY, newX] = [y - dy[i], x - dx[i]]

        if (0 <= newX && newX < width && 
            0 <= newY && newY < height &&
            !(map[newY][newX].DOM.className in notAvailObj)) {
                if (colorMap[newY][newX] !== colors.ZERO && colorMap[newY][newX] !== color) {
                    return [newY, newX]
            }
        }
    }
}
