import { useEffect, useState } from "react"
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage"

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
