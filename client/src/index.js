import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import {ThemeProvider} from '@mui/material/styles'
import {themeOptions} from './Components/theme'
import {inject} from '@vercel/analytics'

const root = ReactDOM.createRoot(document.getElementById('root'))
inject()
root.render(
  <ThemeProvider theme={themeOptions}>
    <App />
  </ThemeProvider>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
