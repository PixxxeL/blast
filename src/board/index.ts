import * as PIXI from 'pixi.js'
import type { Sprite, Container } from 'pixi.js'

import type Game from '@/game/index'
import Label from '@/widgets/label'
import { spriteById } from '@/utils'
import type { RootState } from '@/game/store'
import Engine from '@/board/engine'


export default class BoardScene extends PIXI.Container {

    private game:Game
    private boardContainer:Container
    private engine:Engine
    private prevScale:number|null = null
    private prevZ:number|null = null

    constructor(game:Game) {
        super()
        this.game = game
        this.setup()
    }

    private setup() {
        const background:Sprite = PIXI.Sprite.from('board/background')
        this.addChild(background)

        const pad:number = 30
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

        const { game, board } = this.getState()
        const scoresText:string = `${game.scores}/${board.settings.scores}`
        const movesScores:Label = new Label(scoresText, 170, {
            fontSize: 26
        })
        movesScores.x = (background.width - movesScores.width) * .5 + 38
        movesScores.y = pad + 44
        this.addChild(movesScores)

        const stepsText:string = `${board.settings.steps - game.steps}`
        const movesSteps:Label = new Label(stepsText, 170, {
            fontSize: 32
        })
        movesSteps.x = (background.width - movesSteps.width) * .5 - 90
        movesSteps.y = pad + 28
        this.addChild(movesSteps)

        const boardPanel:Sprite = spriteById('board-panel', 'board/board')
        boardPanel.width = 359
        boardPanel.height = 400
        boardPanel.x = (background.width - boardPanel.width) * .5
        boardPanel.y = pad + 100 + 20
        this.addChild(boardPanel)

        this.boardContainer = new PIXI.Container()
        this.boardContainer.sortableChildren = true
        this.engine = new Engine(board.settings.tiles)
        this.engineToBoard()
        this.boardContainer.x = (background.width - this.boardContainer.width) * .5
        this.boardContainer.y = (background.height - this.boardContainer.height) * .5 - 14
        this.addChild(this.boardContainer)
    }

    private engineToBoard():void {
        this.boardContainer.removeChildren()
        for (let i:number = 0; i < this.engine.height; i++) {
            for (let j:number = 0; j < this.engine.width; j++) {
                const idx:number = i * this.engine.width + j
                const type:string = this.engine.board[idx]
                this.addGem(idx, type, j, i)
            }
        }
    }

    private addGem(index:number, type:string, row:number, col:number):void {
        const { size, gap } = this.getState().board.settings.tiles
        const x:number = row * size + size * 0.5 + gap * (row + 1)
        const y:number = col * size + size * 0.5 + gap * (col + 1)
        this.addGemSprite(index, type, x, y)
    }

    private addGemSprite(index:number, type:string, x:number, y:number):void {
        const size:number = this.getState().board.settings.tiles.size
        const sprite:Sprite = spriteById(`block-${type}`, 'board/board')
        //sprite.userData = {
        //    index,
        //    type
        //}
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
        sprite.on('pointerup', this.onUpPointer.bind(this))
        sprite.on('mouseover', this.overGem.bind(this))
        sprite.on('mouseout', this.outGem.bind(this))
        this.boardContainer.addChild(sprite)
    }

    private onDownPointer(event:UIEvent):void {
        console.log('Down', event.target)
    }

    private onUpPointer(event:UIEvent):void {
        console.log('Up', event.target)
    }

    private overGem(event:UIEvent):void {
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
    }

    private getState():RootState {
        return this.game.store.getState()
    }

}
