import React, {createContext, useContext, useEffect, useState} from 'react'
import fr from '../locales/fr.js'
import en from '../locales/en.js'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'fr'
    })

    useEffect(() => {
        localStorage.setItem('language', language)
    }, [language])

    const translations = { fr, en }

    const t = (key, params = {}) => {
        const keys = key.split('.')
        let value = translations[language]

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k]
            } else {
                return key
            }
        }

        // Interpolation des variables {variable}
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match
            })
        }

        return value
    }

    return (
        <LanguageContext.Provider value={{ t, language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useTranslation = () => useContext(LanguageContext)