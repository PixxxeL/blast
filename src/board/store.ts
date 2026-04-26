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
            return state
        }
    }
})
