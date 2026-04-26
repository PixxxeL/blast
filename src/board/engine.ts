import { randIntRange } from '@/utils'


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

    pick(idx:number): [number[], Array<{index:number, newIndex:number, removed:number, type:string}>, Array<{newIndex:number, type:string}>] {
        if (this.board[idx] === null) {
            return [[], [], []]
        }
        const forRemove:number[] = this.removeGroup(idx)
        if (forRemove.length < 3) {
            return [[], [], []]
        }
        
        for (const removeIdx of forRemove) {
            this.board[removeIdx] = null
        }
        
        const forFalls:Array<{index:number, newIndex:number, removed:number, type:string}> = []
        const forAdds:Array<{newIndex:number, type:string}> = []
        
        for (let col:number = 0; col < this.width; col++) {
            const columnTiles:Array<{index:number, type:string}> = []
            for (let row:number = this.height - 1; row >= 0; row--) {
                const index:number = row * this.width + col
                const tile:string|null = this.board[index]
                if (tile !== null) {
                    columnTiles.push({index, type: tile})
                }
            }
            
            let writeRow:number = this.height - 1
            for (const tile of columnTiles) {
                const newIndex:number = writeRow * this.width + col
                if (tile.index !== newIndex) {
                    const oldRow:number = Math.floor(tile.index / this.width)
                    const fallDistance:number = writeRow - oldRow
                    forFalls.push({
                        index: tile.index,
                        newIndex: newIndex,
                        removed: fallDistance,
                        type: tile.type
                    })
                    this.board[newIndex] = tile.type
                }
                writeRow--
            }
            
            for (let row:number = writeRow; row >= 0; row--) {
                const newIndex:number = row * this.width + col
                const newType:string = this.randType()
                forAdds.push({newIndex, type: newType})
                this.board[newIndex] = newType
            }
        }
        
        return [forRemove, forFalls, forAdds]
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
                if (count >= 3) {
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

    private removeGroup(startIdx:number):number[] {
        const targetType:string|null = this.board[startIdx]
        if (targetType === null) {
            return []
        }
        
        const visited:Set<number> = new Set()
        const group:number[] = []
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
            if (row > 0) neighbors.push((row - 1) * this.width + col)
            if (row < this.height - 1) neighbors.push((row + 1) * this.width + col)
            if (col > 0) neighbors.push(row * this.width + (col - 1))
            if (col < this.width - 1) neighbors.push(row * this.width + (col + 1))
            
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && this.board[neighbor] === targetType) {
                    queue.push(neighbor)
                }
            }
        }
        
        return group
    }

}
