import * as PIXI from 'pixi.js'
import Styles from '@/widgets/styles'


interface LabelOptions {
    fontFamily?: string[] | string
    fontSize?: number
    fontColor?: number
    lineHeight?: number
    align?: string
    textAnchor?: number
    padding?: number
    backgroundColor?: number | null
    backgroundAlpha?: number
    borderColor?: number | null
    borderRadius?: number
    borderWidth?: number
    stroke?: number
    dropShadow?: boolean
}

class Label extends PIXI.Container {
    maxWidth:number
    fontFamily:string[] | string
    fontSize:number
    fontColor:number
    lineHeight:number
    align:string
    textAnchor:number
    padding:number
    backgroundColor:number | null
    backgroundAlpha:number
    borderColor:number | null
    borderRadius:number
    borderWidth:number
    stroke:number | undefined
    dropShadow:boolean | undefined
    textField:PIXI.Text
    background:PIXI.Graphics

    constructor(text:string = '', maxWidth:number = 400, options:LabelOptions = {}) {
        super()
        this.maxWidth = maxWidth
        this.fontFamily = options.fontFamily ?? Styles.fontFamily
        this.fontSize = options.fontSize ?? Styles.fontSize
        this.fontColor = options.fontColor ?? Styles.fontColor
        this.lineHeight = options.lineHeight ?? Styles.lineHeight
        this.align = options.align ?? Styles.align
        this.textAnchor = 'textAnchor' in options ? options.textAnchor : Styles.textAnchor
        this.padding = options.padding !== undefined ? options.padding : Styles.padding
        this.backgroundColor = 'backgroundColor' in options ? options.backgroundColor : Styles.backgroundColor
        this.backgroundAlpha = 'backgroundAlpha' in options ? options.backgroundAlpha : Styles.backgroundAlpha
        this.borderColor = 'borderColor' in options ? options.borderColor : null
        this.borderRadius = options.borderRadius ?? Styles.borderRadius
        this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : Styles.borderWidth
        this.stroke = 'stroke' in options ? options.stroke : undefined
        this.lineHeight = 'lineHeight' in options ? options.lineHeight : 0
        this.dropShadow = 'dropShadow' in options ? options.dropShadow : undefined
        if (this.align === 'center') {
            this.textAnchor = 0.5
        } else if (this.align === 'right') {
            this.textAnchor = 1
        }

        this.textField = this.generateTextField(text, this.maxWidth - this.padding * 2)
        if (this.textAnchor) {
            this.textField.x = this.maxWidth * this.textAnchor + this.padding
            this.textField.y = this.textField.height * this.textAnchor + this.padding
            this.textField.anchor.set(this.textAnchor)
        } else {
            this.textField.x = this.padding
            this.textField.y = this.padding
        }

        this.background = this.generateBackground(this.maxWidth, this.textField.height + this.padding * 2)

        this.addChild(this.background, this.textField)
    }

    get text():string {
        return this.textField.text
    }

    set text(text:string) {
        this.textField.text = text
    }

    generateTextField(text:string, width:number):PIXI.Text {
        return new PIXI.Text({
            text,
            style: new PIXI.TextStyle({
                fontFamily: this.fontFamily,
                fontSize: this.fontSize,
                fill: this.fontColor,
                lineHeight: this.lineHeight,
                wordWrap: true,
                wordWrapWidth: width,
                stroke: this.stroke,
                lineHeight: this.lineHeight,
                dropShadow: this.dropShadow,
                align: this.align
            })
        })
    }

    generateBackground(w:number, h:number):PIXI.Graphics {
        const g = new PIXI.Graphics()
        g.roundRect(0, 0, w, h, this.borderRadius)
        g.fill({
            color: this.backgroundColor ?? 0,
            alpha: this.backgroundColor !== null ? this.backgroundAlpha : 0
        })
        if (this.borderColor !== null && this.borderColor !== undefined) {
            g.stroke({
                width: this.borderWidth,
                color: this.borderColor
            })
        }
        return g
    }
}

export default Label
