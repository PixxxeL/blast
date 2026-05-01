import * as PIXI from 'pixi.js'


// должен строго соответствовать ключу данных board.settings.tiles.types
export type TileTypes = 'blue'|'green'|'purpure'|'yellow'|'red'

export interface TileData {
    index:number
    type:TileTypes
}

export type TileSprite = PIXI.Sprite & { tileData: TileData }

export type BoosterType = 'bomb'|'swap'

export type BoardRemoved = number[]

export type BoardFalls = Array<{
    index: number
    newIndex: number
}>

export type BoardAdds = Array<{
    newIndex: number
    type: string
}>

export type BoardActionResult = [BoardRemoved, BoardFalls, BoardAdds]
