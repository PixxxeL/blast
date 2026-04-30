import * as PIXI from 'pixi.js'
import type { Sprite } from 'pixi.js'

import Game from '@/game/index'
import Label from '@/widgets/label'
import { spriteById } from '@/utils'
import type { BoosterType } from '@/types'


export default class Booster extends PIXI.Container {

    private game:Game
    private type:string
    private _count:number = 0
    private countLabel:Label

    constructor(game:Game, type:BoosterType, count:number=0) {
        super()
        this.game = game
        this.type = type
        this._count = count
        this.setup()
    }

    setup() {
        const panel:Sprite = spriteById('bonus-panel', 'board/board')
        this.addChild(panel)
        const icon = spriteById(`booster-${this.type}`, 'board/board') as Sprite
        icon.x = (panel.width - icon.width) * .5
        icon.y = (panel.height - icon.height) * .5 - 60
        this.addChild(icon)
        this.countLabel = new Label(`${this._count}`, 170, {
            fontSize: 80
        })
        this.countLabel.x = (panel.width - this.countLabel.width) * .5
        this.countLabel.y = (panel.height - this.countLabel.height) * .5 + 60
        this.addChild(this.countLabel)

        this.cursor = 'pointer'
        this.eventMode = 'static'
        this.on('pointerdown', this.onClick)

        this.pivot.set(this.width * .5, this.height * .5)
    }

    get count():number {
        return this._count
    }

    set count(value:number) {
        this._count = value
        this.countLabel.text = `${value}`
    }

    onClick(event:PIXI.FederatedPointerEvent) {
        event.stopPropagation()
        if (this.game.store.getState().board.boosterMode) {
            return
        }
        this.game.store.dispatch({
            type: 'board/boosterOn',
            payload: this.type
        })
    }

}
