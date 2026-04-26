import * as PIXI from 'pixi.js'


export abstract class BaseScene extends PIXI.Container {
    abstract onResize(event: UIEvent):void
    abstract tick(time:PIXI.Ticker):void
}
