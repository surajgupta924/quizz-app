import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => { const [dark, setDark] = useState(() => localStorage.theme === 'dark'); useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.theme = dark ? 'dark' : 'light'; }, [dark]); return <ThemeContext.Provider value={{ dark, toggle: () => setDark(v => !v) }}>{children}</ThemeContext.Provider>; };
export const useTheme = () => useContext(ThemeContext);
