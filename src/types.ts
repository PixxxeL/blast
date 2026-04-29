import * as PIXI from 'pixi.js'


export interface TileData {
    index:number
    type:string // @TODO: enum from data
}

export type TileSprite = PIXI.Sprite & { tileData: TileData }

export type BoosterType = 'bomb'|'swap'
