import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { board } from '@/data.json'


const SCORES_FACTOR:number = 2

export default createSlice({
    name: 'board',
    initialState: board,
    reducers: {
        makeStep(state, action:PayloadAction<number>) {
            const count:number = action.payload
            let factor:number = SCORES_FACTOR * count / 3
            state.steps += 1
            state.scores += (count * factor|0)
        },
        reset(state) {
            state.steps = 0
            state.scores = 0
            state.boosters = {...state.settings.boosters}
        },
        boosterOn(state, action:PayloadAction<string>) {
            const oldCount:number = state.boosters[action.payload] ?? 0,
                newCount:number = oldCount - 1
            if (oldCount > 0) {
                state.boosterMode = action.payload
            }
            state.boosters[action.payload] = Math.max(0, newCount)
        },
        consumeBombBooster(state, action:PayloadAction<number>) {
            state.boosterMode = null
            state.steps += 1
            state.scores += action.payload * SCORES_FACTOR
        },
        consumeSwapBooster(state) {
            state.boosterMode = null
            state.selected = null
        },
        selectSwapIndex(state, action:PayloadAction<number>) {
            state.selected = action.payload
        },
        cancelBooster(state, action:PayloadAction<string>) {
            state.boosterMode = null
            state.selected = null
            const newCount:number = state.boosters[action.payload] + 1
            state.boosters[action.payload] = Math.min(
                state.settings.boosters[action.payload], newCount
            )
        }
    }
})
