import { randIntRange } from '@/utils'


export default class Engine {

    width:number
    height:number
    dimension:number
    types:string[]
    board:(string | null)[]

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

    getConnectedGroup(idx:number):number[] {
        const targetType:string | null = this.board[idx]
        if (targetType === null) {
            return []
        }
        const visited:Set<number> = new Set()
        const queue:number[] = [idx]
        const group:number[] = []

        visited.add(idx)
        group.push(idx)

        while (queue.length > 0) {
            const current:number = queue.shift()!
            const row:number = Math.floor(current / this.width)
            const col:number = current % this.width
            const directions: { r:number, c:number }[] = [
                { r: 0, c: -1 },
                { r: 0, c: 1 },
                { r: -1, c: 0 },
                { r: 1, c: 0 }
            ]

            for (const d of directions) {
                const nr:number = row + d.r
                const nc:number = col + d.c
                if (nr >= 0 && nr < this.height && nc >= 0 && nc < this.width) {
                    const nIdx:number = nr * this.width + nc
                    if (!visited.has(nIdx) && this.board[nIdx] === targetType) {
                        visited.add(nIdx)
                        group.push(nIdx)
                        queue.push(nIdx)
                    }
                }
            }
        }
        return group
    }

    removeGroup(idx:number):number {
        const group:number[] = this.getConnectedGroup(idx)
        for (const i of group) {
            this.board[i] = null
        }
        return group.length
    }

    applyGravity():void {
        for (let col:number = 0; col < this.width; col++) {
            const tiles:string[] = []
            for (let row:number = 0; row < this.height; row++) {
                const idx:number = row * this.width + col
                const val:string | null = this.board[idx]
                if (val !== null) {
                    tiles.push(val)
                }
            }
            const emptyCount:number = this.height - tiles.length
            for (let row:number = 0; row < this.height; row++) {
                const idx:number = row * this.width + col
                if (row < emptyCount) {
                    this.board[idx] = null
                } else {
                    this.board[idx] = tiles[row - emptyCount]
                }
            }
        }
    }

    fillTop():void {
        for (let i:number = 0; i < this.dimension; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.randType()
            }
        }
    }

    processClick(idx:number):void {
        if (this.board[idx] === null) {
            return
        }
        this.removeGroup(idx)
        this.applyGravity()
        this.fillTop()
    }
}
