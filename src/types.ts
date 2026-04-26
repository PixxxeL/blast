import * as PIXI from 'pixi.js'


export interface TileData {
    index:number
    type:string // may be enum from data
}

export type TileSprite = PIXI.Sprite & { tileData: TileData };
