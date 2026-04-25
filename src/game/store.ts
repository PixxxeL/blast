import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { Slice, EnhancedStore } from '@reduxjs/toolkit'
import { game } from '@/data.json'
import Game from '@/game/index'
import board from '@/board/store'


const gameSlice:Slice = createSlice({
    name: 'game',
    initialState: game,
    reducers: {
        //
    }
})

const store:EnhancedStore = configureStore({
    reducer: {
        game: gameSlice.reducer,
        board: board.reducer
    }
})

export type AppStore = typeof store & {
    game?: Game
    use: (game: Game) => void
}

const appStore = store as AppStore

appStore.use = (game) => {
    appStore.game = game
    game.store = appStore
}

export default appStore

export type RootState = ReturnType<typeof store.getState>
