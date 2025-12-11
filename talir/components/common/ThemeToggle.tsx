"use client"

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useThemeStore } from '@/lib/store'

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Button variant="ghost" size="icon" disabled><Sun className="h-5 w-5" /></Button>
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
                <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
            ) : (
                <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
            )}
        </Button>
    )
}
