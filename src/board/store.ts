import { createSlice } from '@reduxjs/toolkit'
import { board } from '@/data.json'


const SCORES_FACTOR:number = 2

export default createSlice({
    name: 'board',
    initialState: board,
    reducers: {
        makeStep(state, action) {
            const count:number = action.payload
            let factor:number = SCORES_FACTOR * count / 3
            state.steps += 1
            state.scores += (count * factor|0)
            return state
        },
        reset(state) {
            state.steps = 0
            state.scores = 0
            state.boosters = {...state.settings.boosters}
            return state
        },
        boosterOn(state, action) {
            const oldCount:number = state.boosters[action.payload],
                newCount:number = oldCount - 1
            if (oldCount > 0) {
                state.boosterMode = action.payload
            }
            state.boosters[action.payload] = Math.max(0, newCount)
            return state
        },
        consumeBombBooster(state, action) {
            state.boosterMode = null
            state.steps += 1
            state.scores += action.payload * SCORES_FACTOR
            return state
        },
        consumeSwapBooster(state) {
            state.boosterMode = null
            state.selected = null
            return state
        },
        selectSwapIndex(state, action) {
            state.selected = action.payload
            return state
        },
        cancelBooster(state, action) {
            state.boosterMode = null
            state.selected = null
            const newCount:number = state.boosters[action.payload] + 1
            state.boosters[action.payload] = Math.min(
                state.settings.boosters[action.payload], newCount
            )
            return state
        }
    }
})
