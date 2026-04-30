import * as PIXI from 'pixi.js'
import type { Texture, Sprite } from 'pixi.js'


const randRange = (min:number, max:number):number => {
    return Math.random() * (max - min) + min
}

const randIntRange = (min:number, max:number):number => {
    return Math.floor(randRange(min, max))
}

const hexToInt = (color:string):number => {
    if (color.indexOf('#') === 0) {
        color = color.substr(1)
    }
    return parseInt(color, 16) || 0
}

const textureById = (id:string, atlas:string):Texture => {
    const { textures } = PIXI.Texture.from(atlas)
    return textures[`${id}.png`]
}

const spriteById = (id:string, atlas:string):Sprite => PIXI.Sprite.from(textureById(id, atlas))

export {
    textureById, spriteById, randRange, randIntRange, hexToInt
}
