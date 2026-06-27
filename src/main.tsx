import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// Basic enterprise theme matching the visual direction requirements
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#d32f2f' }, // deep red
    background: { default: '#f5f5f5', paper: '#ffffff' },
    secondary: { main: '#001f3f' }, // dark navy for sidebar
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
