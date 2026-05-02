import { randIntRange } from '@/utils'
import type { BoardRemoved, BoardFalls, BoardAdds, BoardActionResult } from '@/types'


const BOMB_DISTANCE:number = 1
const MATCH_THRESHOLD:number = 3

export default class Engine {

    readonly width:number
    readonly height:number
    readonly dimension:number
    readonly types:string[]
    board:(string|null)[] = []

    constructor(config: {
        horizontal:number,
        vertical:number,
        types:string[]
    }) {
        this.width = config.horizontal
        this.height = config.vertical
        this.dimension = this.width * this.height
        this.types = config.types
        this.reset()
    }

    reset():void {
        this.board = []
        for (let idx:number = 0; idx < this.dimension; idx++) {
            this.board.push(this.randType())
        }
    }

    randType():string {
        return this.types[randIntRange(0, this.types.length)]
    }

    pick(idx:number):BoardActionResult {
        if (this.board[idx] === null) {
            return [[], [], []]
        }
        const forRemove:BoardRemoved = this.removeGroup(idx)
        if (forRemove.length < MATCH_THRESHOLD) {
            return [[], [], []]
        }
        for (const removeIdx of forRemove) {
            this.board[removeIdx] = null
        }
        const [forFalls, forAdds] = this.applyFallsAndAdds()
        return [forRemove, forFalls, forAdds]
    }

    bomb(idx:number):BoardActionResult {
        if (this.board[idx] === null) {
            return [[], [], []]
        }
        const targetRow = Math.floor(idx / this.width)
        const targetCol = idx % this.width
        const forRemove:BoardRemoved = []
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                const dr = Math.abs(r - targetRow)
                const dc = Math.abs(c - targetCol)
                if (dr <= BOMB_DISTANCE && dc <= BOMB_DISTANCE) {
                    const index = r * this.width + c
                    if (this.board[index] !== null) {
                        forRemove.push(index)
                    }
                }
            }
        }
        for (const removeIdx of forRemove) {
            this.board[removeIdx] = null
        }
        const [forFalls, forAdds] = this.applyFallsAndAdds()
        return [forRemove, forFalls, forAdds]
    }

    swap(fromIdx:number, toIdx:number):void {
        const fromType:string = this.board[fromIdx]
        const toType:string = this.board[toIdx]
        this.board[fromIdx] = toType
        this.board[toIdx] = fromType
    }

    hasValidMove():boolean {
        const visited:boolean[] = new Array<boolean>(this.dimension).fill(false)
        for (let i:number = 0; i < this.dimension; i++) {
            if (this.board[i] === null || visited[i]) {
                continue
            }
            const type:string|null = this.board[i]
            const queue:number[] = [i]
            visited[i] = true
            let count:number = 0
            while (queue.length > 0) {
                const current:number = queue.shift()!
                count++
                if (count >= MATCH_THRESHOLD) {
                    return true
                }
                const row:number = Math.floor(current / this.width)
                const col:number = current % this.width
                const neighbors:number[] = []
                if (row > 0) {
                    neighbors.push((row - 1) * this.width + col)
                }
                if (row < this.height - 1) {
                    neighbors.push((row + 1) * this.width + col)
                }
                if (col > 0) {
                    neighbors.push(row * this.width + (col - 1))
                }
                if (col < this.width - 1) {
                    neighbors.push(row * this.width + (col + 1))
                }
                for (const n of neighbors) {
                    if (!visited[n] && this.board[n] === type) {
                        visited[n] = true
                        queue.push(n)
                    }
                }
            }
        }
        return false
    }

    private removeGroup(startIdx:number):BoardRemoved {
        const targetType:string|null = this.board[startIdx]
        if (targetType === null) {
            return []
        }
        const visited:Set<number> = new Set()
        const group:BoardRemoved = []
        const queue:number[] = [startIdx]
        while (queue.length > 0) {
            const current:number = queue.shift()!
            if (visited.has(current)) {
                continue
            }
            if (this.board[current] !== targetType) {
                continue
            }
            visited.add(current)
            group.push(current)
            const row:number = Math.floor(current / this.width)
            const col:number = current % this.width
            const neighbors:number[] = []
            if (row > 0) {
                neighbors.push((row - 1) * this.width + col)
            }
            if (row < this.height - 1) {
                neighbors.push((row + 1) * this.width + col)
            }
            if (col > 0) {
                neighbors.push(row * this.width + (col - 1))
            }
            if (col < this.width - 1) {
                neighbors.push(row * this.width + (col + 1))
            }
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && this.board[neighbor] === targetType) {
                    queue.push(neighbor)
                }
            }
        }
        return group
    }

    private applyFallsAndAdds():[BoardFalls, BoardAdds] {
        const forFalls:BoardFalls = []
        const forAdds:BoardAdds = []
        for (let col = 0; col < this.width; col++) {
            const columnTiles: Array<{ index: number, type: string }> = []
            for (let row = this.height - 1; row >= 0; row--) {
                const index = row * this.width + col
                const tile = this.board[index]
                if (tile !== null) {
                    columnTiles.push({ index, type: tile })
                }
            }
            let writeRow = this.height - 1
            for (const tile of columnTiles) {
                const newIndex = writeRow * this.width + col
                if (tile.index !== newIndex) {
                    //const oldRow = Math.floor(tile.index / this.width)
                    //const fallDistance = writeRow - oldRow
                    forFalls.push({
                        index: tile.index,
                        newIndex,
                        //removed: fallDistance
                    })
                    this.board[newIndex] = tile.type
                }
                writeRow--
            }
            for (let row = writeRow; row >= 0; row--) {
                const newIndex = row * this.width + col
                const newType = this.randType()
                forAdds.push({ newIndex, type: newType })
                this.board[newIndex] = newType
            }
        }
        return [forFalls, forAdds]
    }

}
