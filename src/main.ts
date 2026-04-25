import { version } from '../package.json'
import '../main.sass'
import Game from '@/game/index'


console.log(`Game version: ${version}`)

const game:Game = new Game('game-container')

await game.init()
