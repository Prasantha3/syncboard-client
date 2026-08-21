import { createContext, useContext, useState } from "react";


const ThemeContext = createContext();


export function ThemeProvider({ children }){
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            <div className={'app-container ${theme}-theme'}>
                {children}
                </div>
                </ThemeContext.Provider>
    );
}

export function useTheme(){
    const context = useContext(ThemeContext);
    if (!context){
        throw new Error ('usseTheme must be used within a ThemeProvider');
    }

    return context;
}