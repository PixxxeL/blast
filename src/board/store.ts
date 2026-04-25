import { createSlice } from '@reduxjs/toolkit'
import { board } from '@/data.json'


export default createSlice({
    name: 'board',
    initialState: board,
    reducers: {
        //
    }
})
