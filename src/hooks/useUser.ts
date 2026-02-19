"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserData {
    user: User | null
    loading: boolean
    fullName: string
    email: string
    avatarUrl: string | null
    initials: string
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0].toUpperCase())
        .slice(0, 2)
        .join("")
}

export function useUser(): UserData {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get the current user on mount
        const getUser = async () => {
            try {
                const {
                    data: { user: currentUser },
                } = await supabase.auth.getUser()
                setUser(currentUser)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getUser()

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const fullName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "User"

    const email = user?.email || ""

    const avatarUrl =
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        null

    const initials = getInitials(fullName)

    return { user, loading, fullName, email, avatarUrl, initials }
}
