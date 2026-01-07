import React, { createContext, useContext, useState } from 'react'
import fr from '../locales/fr.js'
import en from '../locales/en.js'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('fr')

    const translations = { fr, en }

    const t = (key) => {
        const keys = key.split('.')
        let value = translations[language]

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k]
            } else {
                return key // Retourne la clé si traduction non trouvée
            }
        }

        return value
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useTranslation = () => useContext(LanguageContext)