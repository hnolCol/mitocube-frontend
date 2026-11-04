import { createContext, useContext, useEffect, useState } from "react"
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage"

const ThemeContext = createContext({ theme: "light", toggleTheme: () => { }, setTheme: () => { } })

/**
 * @description Access the app theme from anywhere (e.g. to pass ```darkmode``` into @mitocube/viz components).
 * @returns {{theme: String, toggleTheme: Function, setTheme: Function}}
 */
export function useThemeContext() {
    return useContext(ThemeContext)
}

const THEME_STORAGE_KEY = "appTheme"
const VALID_THEMES = ["light", "dark"]

function readStoredTheme() {
    const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: THEME_STORAGE_KEY })
    return itemFound && VALID_THEMES.includes(itemValue) ? itemValue : "light"
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
}

/**
 * @description Theme hook for the light/dark mode skeleton. Persists the choice in
 * localStorage and reflects it on the html element as the ```data-theme``` attribute,
 * which drives the CSS variables in theme.css.
 * @returns {{theme: String, toggleTheme: Function, setTheme: Function}}
 */
export function useTheme() {
    const [theme, setThemeState] = useState(readStoredTheme)

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    const setTheme = (nextTheme) => {
        if (!VALID_THEMES.includes(nextTheme)) return
        setThemeState(nextTheme)
        saveInLocalStorage({ itemName: THEME_STORAGE_KEY, itemValue: nextTheme })
    }

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

    return { theme, toggleTheme, setTheme }
}

/**
 * @description Context provider that exposes the useTheme state to the tree below it.
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 * @returns
 */
export function ThemeProvider({ children }) {
    const { theme, toggleTheme, setTheme } = useTheme()
    return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
        {children}
    </ThemeContext.Provider>
}
