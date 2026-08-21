import {useTheme} from '../context/ThemeContext';

export default function Navbar(){
    const { theme, toggleTheme } = useTheme();

    return(
        <nav className="navbar">
            <h2>SyncBoard</h2>
            <button onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode

                </button>
                </nav>
    );
}