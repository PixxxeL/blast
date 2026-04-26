import * as PIXI from 'pixi.js'

import store from '@/game/store'
import type { AppStore, RootState } from '@/game/store'
import type { BaseScene } from '@/widgets/baseScene'
import BoardScene from '@/board/index'


export default class Game {

    store?: AppStore = store
    private container:HTMLElement
    private app:PIXI.Application
    private scenesContainer:PIXI.Container
    private currentComponent:BaseScene
    private scenes:Array<string> = []

    constructor(containerId:string) {
        this.store.use(this)
        this.scenes = this.getState().game.settings.scenes
        this.container = document.getElementById(containerId)
        this.app = new PIXI.Application()
    }

    async init():Promise<void> {
        await this.assetsPrepare()
        await this.app.init({
            antialias: true,
            resizeTo: this.container,
            useBackBuffer: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1
        })
        this.container.appendChild(this.app.canvas)
        this.scenesContainer = new PIXI.Container()
        this.app.stage.addChild(this.scenesContainer)
        window.addEventListener('resize', this.onResize.bind(this), false)
        this.app.ticker.add(this.tick, this)
        await PIXI.Assets.loadBundle(this.scenes, this.onProgress.bind(this))
        this.createScene()
    }

    private async assetsPrepare():Promise<void> {
        const state:RootState = this.getState()
        this.scenes.forEach((scene:string) => {
            const resources:Array<Record<string, string>> = []
            for (const type of state.game.settings.assetTypes) {
                for (const filepath of state[scene][type] || []) {
                    const basename = filepath.split('.')[0]
                    const alias = `${scene}/${basename}`
                    const src = `assets/${scene}/${filepath}`
                    resources.push({
                        alias,
                        src
                    })
                }
            }
            PIXI.Assets.addBundle(scene, resources)
        })
    }

    private onResize(event?:UIEvent):void {
        const viewWidth:number = document.documentElement.clientWidth || window.innerWidth
        const viewHeight:number = document.documentElement.clientHeight || window.innerHeight
        this.currentComponent.scale.set(1)
        const { initWidth, initHeight } = this.getState().game.settings
        const scaleFactor:number = Math.max(viewWidth / initWidth, viewHeight / initHeight)
        this.currentComponent.scale.set(scaleFactor)
        this.currentComponent.x = (viewWidth - initWidth * scaleFactor) * .5
        this.currentComponent.y = (viewHeight - initHeight * scaleFactor) * .5
        this.currentComponent?.onResize(event)
    }

    private tick(time?:PIXI.Ticker):void {
        this.currentComponent?.tick(time)
    }

    private createScene(/*name:string*/):void {
        this.scenesContainer.removeChildren()
        this.currentComponent = new BoardScene(this)
        this.scenesContainer.addChild(this.currentComponent)
        this.onResize()
    }

    private onProgress(progress:number):void {
        console.log(`Loaded: ${progress}`)
    }

    private getState():RootState {
        return this.store.getState()
    }

}
