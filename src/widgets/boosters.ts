import * as PIXI from 'pixi.js'

import Game from '@/game/index'
import Booster from '@/widgets/booster'
import Label from '@/widgets/label'
import type { BoosterType } from '@/types'


let _CACHE:Partial<Record<BoosterType, number>> = {}

export default class Boosters extends PIXI.Container {

    constructor(private game:Game) {
        super()
        this.game.store.subscribe(this.onSubscribe.bind(this))
        this.setup()
    }

    setup() {
        const label = new Label(`БУСТЕРЫ`, 500, {
            fontSize: 80
        })
        this.addChild(label)
        let shift:number = 0
        const { boosters }:{ boosters: Record<BoosterType, number> } = this.game.store.getState().board
        for (const [type, count] of Object.entries(boosters) as [BoosterType, number][]) {
            const booster = new Booster(this.game, type, count as number)
            booster.label = `booster-${type}`
            booster.x = shift
            booster.y = 120
            shift += booster.width
            this.addChild(booster)
        }
        label.x = (this.width - label.width) * .5
    }

    onSubscribe() {
        const { boosters } = this.game.store.getState().board
        if (JSON.stringify(boosters) == JSON.stringify(_CACHE)) {
            return
        }
        _CACHE = {...boosters}
        for (const type of Object.keys(boosters)) {
            const booster = this.getChildByLabel(`booster-${type}`) as Booster
            booster.count = boosters[type]
        }
    }

}
