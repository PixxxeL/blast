import * as PIXI from 'pixi.js'


export interface TileData {
    index:number
    type:string // @TODO: enum from data
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
