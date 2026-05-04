import type { Sprite } from 'pixi.js'


// должен строго соответствовать ключу данных board.settings.tiles.types
export type RegularTypes = 'blue'|'green'|'purpure'|'yellow'|'red'

// должен строго соответствовать ключу данных board.settings.tiles.supers
export type SuperTypes = 'bomb'|'vertical'|'horisontal'

export type TileTypes = RegularTypes|SuperTypes

export interface TileData {
    index: number
    type: TileTypes
}

export type TileSprite = Sprite & { tileData: TileData }

export type BoosterType = 'bomb'|'swap'

export type BoardRemoved = number[]

export type BoardFallsItem = {
    index: number
    newIndex: number
    type: TileTypes
}

export type BoardFalls = BoardFallsItem[]

export type BoardAddsItem = {
    newIndex: number
    type: TileTypes
}

export type BoardAdds = BoardAddsItem[]

export type BoardActionResult = [BoardRemoved, BoardFalls, BoardAdds]

export interface EngineConfig {
    horizontal:number,
    vertical:number,
    types:RegularTypes[],
    supers:SuperTypes[]
}
