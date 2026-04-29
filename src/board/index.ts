import * as PIXI from 'pixi.js'
import type { Sprite, Container } from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'

import type Game from '@/game/index'
import type { RootState } from '@/game/store'
import type { BaseScene } from '@/widgets/baseScene'
import type { TileSprite } from '@/types'
import Label from '@/widgets/label'
import Boosters from '@/widgets/boosters'
import { spriteById } from '@/utils'
import Engine from '@/board/engine'


const HIDE_SPEED:number = 500
const FALL_SPEED:number = 400
const ADD_SPEED:number = 250

export default class BoardScene extends PIXI.Container implements BaseScene {

    private game:Game
    private boardContainer:Container
    private engine:Engine
    private tweens = new TWEEN.Group()
    private lockInteraction:boolean = false
    private scoresLabel:Label
    private stepsLabel:Label
    //private prevScale:number|null = null
    //private prevZ:number|null = null

    constructor(game:Game) {
        super()
        this.game = game
        this.setup()
    }

    onResize(_event:UIEvent):void {
        // @TODO: layout correction
    }

    tick(_time:PIXI.Ticker):void {
        this.tweens.update()
    }

    private setup() {
        this.game.store.dispatch({
            type: 'board/reset'
        })

        const background:Sprite = PIXI.Sprite.from('board/background')
        this.addChild(background)

        const pad:number = 50
        const movesPanel:Sprite  = spriteById('moves-panel', 'board/board')
        movesPanel.width = 305
        movesPanel.height = 112
        movesPanel.x = (background.width - movesPanel.width) * .5
        movesPanel.y = pad
        this.addChild(movesPanel)

        const movesScoresLabel:Label = new Label('ОЧКИ:', 170)
        movesScoresLabel.x = (background.width - movesScoresLabel.width) * .5 + 38
        movesScoresLabel.y = pad + 24
        this.addChild(movesScoresLabel)

        const { scores, steps, settings } = this.getState().board
        const scoresText:string = `${scores}/${settings.scores}`
        this.scoresLabel = new Label(scoresText, 170, {
            fontSize: 26
        })
        this.scoresLabel.x = (background.width - this.scoresLabel.width) * .5 + 38
        this.scoresLabel.y = pad + 44
        this.addChild(this.scoresLabel)

        const stepsDiff:number = Math.max(0, settings.steps - steps)
        this.stepsLabel = new Label(`${stepsDiff}`, 170, {
            fontSize: 32
        })
        this.stepsLabel.x = (background.width - this.stepsLabel.width) * .5 - 90
        this.stepsLabel.y = pad + 28
        this.addChild(this.stepsLabel)

        const boardPanel:Sprite = spriteById('board-panel', 'board/board')
        boardPanel.width = 359
        boardPanel.height = 400
        boardPanel.x = (background.width - boardPanel.width) * .5
        boardPanel.y = pad + 100 + 20
        this.addChild(boardPanel)

        this.boardContainer = new PIXI.Container()
        this.boardContainer.sortableChildren = true
        this.engine = new Engine(settings.tiles)
        this.engineToBoard()
        this.boardContainer.x = (background.width - this.boardContainer.width) * .5
        this.boardContainer.y = (background.height - this.boardContainer.height) * .5 + 8
        this.addChild(this.boardContainer)

        const boostersContainer = new Boosters(this.game)
        boostersContainer.scale = .2
        boostersContainer.x = (background.width - boostersContainer.width) * .5
        boostersContainer.y = (background.height - boostersContainer.height) * .5 + 265
        //this.addChild(boostersContainer)
    }

    private engineToBoard():void {
        this.boardContainer.children.forEach((sprite:TileSprite):void => {
            sprite.removeAllListeners()
            sprite.eventMode = 'none'
        })
        this.boardContainer.removeChildren()
        for (let i:number = 0; i < this.engine.height; i++) {
            for (let j:number = 0; j < this.engine.width; j++) {
                const idx:number = i * this.engine.width + j
                const type:string = this.engine.board[idx]
                this.addTile(idx, type, j, i)
            }
        }
    }

    private addTile(index:number, type:string, row:number, col:number):void {
        const { size, gap } = this.getState().board.settings.tiles
        const x:number = row * size + size * 0.5 + gap * (row + 1)
        const y:number = col * size + size * 0.5 + gap * (col + 1)
        this.addTileSprite(index, type, x, y)
    }

    private addTileSprite(index:number, type:string, x:number, y:number):void {
        const size:number = this.getState().board.settings.tiles.size
        const sprite = spriteById(`block-${type}`, 'board/board') as TileSprite
        sprite.tileData = {
            index,
            type
        }
        sprite.anchor.set(0.5)
        sprite.x = x
        sprite.y = y
        sprite.zIndex = index
        sprite.width = size
        sprite.height = size
        sprite.interactive = true
        sprite.cursor = 'pointer'
        sprite.eventMode = 'static'
        sprite.on('pointerdown', this.onDownPointer.bind(this))
        //sprite.on('pointerup', this.onUpPointer.bind(this))
        //sprite.on('mouseover', this.overGem.bind(this))
        //sprite.on('mouseout', this.outGem.bind(this))
        this.boardContainer.addChild(sprite)
    }

    private onDownPointer(event:UIEvent):void {
        if (this.lockInteraction) {
            return
        }
        const sprite = event.target as TileSprite
        const [forRemove, forFalls, forAdds] = this.engine.pick(sprite.tileData.index)
        if (forRemove.length < 3) {
            return
        }
        this.lockInteraction = true
        const tileSize:number = this.getState().board.settings.tiles.size

        const removePromises:Promise<void>[] = []
        for (const child of this.boardContainer.children) {
            const tileSprite = child as TileSprite
            if (!forRemove.includes(tileSprite.tileData.index)) {
                continue
            }
            const promise = new Promise<void>((resolve) => {
                new TWEEN.Tween(tileSprite.scale, this.tweens)
                    .to({x:0, y:0}, HIDE_SPEED)
                    .easing(TWEEN.Easing.Back.Out)
                    .onComplete(() => {
                        tileSprite.removeAllListeners()
                        tileSprite.eventMode = 'none'
                        this.boardContainer.removeChild(tileSprite)
                        resolve()
                    })
                    .start()
            })
            removePromises.push(promise)
        }

        Promise.all(removePromises).then(() => {
            this.lockInteraction = false
            const fallPromises:Promise<void>[] = []
            for (const fall of forFalls) {
                let tileSprite:TileSprite | undefined;
                for (const child of this.boardContainer.children) {
                    const s = child as TileSprite
                    if (s.tileData.index === fall.index) {
                        tileSprite = s
                        break
                    }
                }
                if (!tileSprite) {
                    continue
                }
                tileSprite.tileData.index = fall.newIndex
                const targetPos = this.indexToPosition(fall.newIndex)
                const promise = new Promise<void>((resolve) => {
                    new TWEEN.Tween(tileSprite, this.tweens)
                        .to({x:targetPos.x, y:targetPos.y}, FALL_SPEED)
                        .easing(TWEEN.Easing.Bounce.Out)
                        .onComplete(() => resolve())
                        .start()
                })
                fallPromises.push(promise)
            }

            Promise.all(fallPromises).then(() => {
                const addPromises:Promise<void>[] = []
                for (const add of forAdds) {
                    const targetPos = this.indexToPosition(add.newIndex)
                    const startPos = {x: targetPos.x, y: targetPos.y - this.engine.height * tileSize}
                    this.addTileSprite(add.newIndex, add.type, startPos.x, startPos.y)

                    let newSprite:TileSprite | undefined
                    for (const child of this.boardContainer.children) {
                        const s = child as TileSprite
                        if (s.tileData.index === add.newIndex) {
                            newSprite = s
                            break
                        }
                    }
                    if (!newSprite) {
                        continue
                    }
                    const promise = new Promise<void>((resolve) => {
                        new TWEEN.Tween(newSprite, this.tweens)
                            .to({y:targetPos.y}, ADD_SPEED)
                            .easing(TWEEN.Easing.Exponential.Out)
                            .onComplete(() => resolve())
                            .start()
                    })
                    addPromises.push(promise)
                }
                Promise.all(addPromises).then(() => {
                    this.game.store.dispatch({
                        type: 'board/makeStep',
                        payload: forRemove.length
                    })
                    this.makeStep()
                    if (!this.engine.hasValidMove()) {
                        alert('Ходов больше нет, перемешиваю!')
                        this.engine.reset()
                        this.engineToBoard()
                    }
                })
            })
        })
    }

    private indexToPosition(index:number):{x:number, y:number} {
        const row = Math.floor(index / this.engine.width)
        const col = index % this.engine.width
        const { size, gap } = this.getState().board.settings.tiles
        return {
            x: col * size + size * .5 + gap * (col + 1),
            y: row * size + size * .5 + gap * (row + 1)
        }
    }

    /*private onUpPointer(event:UIEvent):void {
        console.log('Up', event.target)
    }*/

    /*private overGem(event:UIEvent):void {
        const sprite:Sprite = event.target as Sprite
        this.prevScale = sprite.scale.x
        const { upscaleFactor } = this.getState().board.settings.tiles
        sprite.scale.set(this.prevScale * upscaleFactor)
        this.prevZ = sprite.zIndex
        sprite.zIndex = this.engine.dimension
    }

    private outGem(event:UIEvent):void {
        const sprite:Sprite = event.currentTarget as Sprite
        if (this.prevScale) {
            sprite.scale.set(this.prevScale)
        }
        if (this.prevZ) {
            sprite.zIndex = this.prevZ
        }
    }*/

    private makeStep():void {
        let [ stepsDiff, scores, targetScores ] = this.getWinTerms()
        if (scores >= targetScores) {
            [ stepsDiff, scores, targetScores ] = this.resetBoard('Вы выиграли! Молодец!')
        }
        if (!stepsDiff) {
            [ stepsDiff, scores, targetScores ] = this.resetBoard('Вы проиграли! Попробуйте еще раз.')
        }
        this.scoresLabel.text = `${scores}/${targetScores}`
        this.stepsLabel.text = `${stepsDiff}`
    }

    private resetBoard(message:string|null):[number, number, number] {
        if (message) {
            alert(message)
        }
        this.game.store.dispatch({
            type: 'board/reset'
        })
        this.engine.reset()
        this.engineToBoard()
        return this.getWinTerms()
    }

    private getWinTerms():[number, number, number] {
        const { scores, steps, settings } = this.getState().board
        const stepsDiff:number = Math.max(0, settings.steps - steps)
        return [stepsDiff, scores, settings.scores]
    }

    private getState():RootState {
        return this.game.store.getState()
    }

}
