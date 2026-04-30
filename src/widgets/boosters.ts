import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'

import Game from '@/game/index'
import Booster from '@/widgets/booster'
import Label from '@/widgets/label'
import type { BoosterType } from '@/types'


const PULSE_SPEED:number = 500
const SCALE_FACTOR:number = 1.2
let _COUNTS_PREV:Partial<Record<BoosterType, number>> = {}
let _MODE_PREV:BoosterType|null

export default class Boosters extends PIXI.Container {

    private prevScale:number
    private tweenBooster:Booster
    private tween:TWEEN.Tween|null

    constructor(private game:Game, private tweens:TWEEN.Group) {
        super()
        /*this.unsubscribe =*/ this.game.store.subscribe(this.onSubscribe.bind(this))
        this.setup()
    }

    private setup():void {
        const label = new Label(`БУСТЕРЫ`, 500, {
            fontSize: 80
        })
        this.addChild(label)
        let shift:number = 0
        const { boosters }:{ boosters: Record<BoosterType, number> } = this.game.store.getState().board
        for (const [type, count] of Object.entries(boosters) as [BoosterType, number][]) {
            const booster = new Booster(this.game, type, count as number)
            booster.label = `booster-${type}`
            booster.x = shift + booster.width * .5
            booster.y = 120 + booster.height * .5
            shift += booster.width
            this.addChild(booster)
        }
        label.x = (this.width - label.width) * .5
    }

    private onSubscribe():void {
        const { boosters, boosterMode } = this.game.store.getState().board
        if (JSON.stringify(boosters) != JSON.stringify(_COUNTS_PREV)) {
            // change count
            for (let mode of Object.keys(boosters)) {
                const booster = this.getChildByLabel(`booster-${mode}`) as Booster
                booster.count = boosters[mode]
                if (mode === boosterMode) {
                    this.tweenBooster = booster
                }
            }
            if (this.tweenBooster && !this.tween) {
                this.prevScale = this.tweenBooster.scale.x
                const targetScale = this.prevScale * SCALE_FACTOR
                this.tween = new TWEEN.Tween(this.tweenBooster.scale, this.tweens)
                    .to({
                        x: targetScale,
                        y: targetScale
                    }, PULSE_SPEED * .5)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                const back = new TWEEN.Tween(this.tweenBooster.scale, this.tweens)
                    .to({
                        x: this.prevScale,
                        y: this.prevScale
                    }, PULSE_SPEED * .5)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                this.tween.chain(back)
                back.chain(this.tween)
                this.tween.start()
            }
            _COUNTS_PREV = {...boosters}
        }
        if (boosterMode != _MODE_PREV) {
            // change mode
            if (!boosterMode) {
                this.stopPulse()
            }
            _MODE_PREV = boosterMode
        }
    }

    private stopPulse():void {
        if (this.tween) {
            this.tween.stop()
            this.tween.chain()
            this.tween = null
            if (this.tweenBooster && this.prevScale) {
                this.tweenBooster.scale.set(this.prevScale, this.prevScale)
            }
            this.prevScale = null
            this.tweenBooster = null
        }
    }

}
