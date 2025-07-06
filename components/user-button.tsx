"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, X, LogIn, Calendar, LogOut } from "lucide-react"

interface UserButtonProps {
  className?: string
}

export function UserButton({ className = "" }: UserButtonProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulation de connexion
    setIsLoggedIn(true)
    setIsLoginModalOpen(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowDropdown(false)
  }

  const LoginModal = () => {
    if (!isLoginModalOpen) return null

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ paddingTop: "80px" }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsLoginModalOpen(false)} />

        <Card className="relative w-full max-w-md bg-cream border-gold/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 max-h-[calc(90vh-80px)] overflow-y-auto z-[10000]">
          <CardHeader className="relative pb-4">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 text-charcoal hover:text-gold transition-colors z-[10001] p-1 hover:bg-rose/20 rounded-full"
            >
              <X size={20} />
            </button>
            <CardTitle className="text-2xl font-playfair font-bold text-charcoal flex items-center gap-2 pr-12">
              <LogIn size={24} />
              Connexion Praticienne
            </CardTitle>
            <div className="w-full h-px bg-rose mt-4" />
          </CardHeader>

          <CardContent className="space-y-6 relative z-[10001]">
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <Input
                  type="email"
                  placeholder="Adresse email"
                  className="border-gray-light focus:border-gold focus:ring-2 focus:ring-gold/20 relative z-[10002]"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  className="border-gray-light focus:border-gold focus:ring-2 focus:ring-gold/20 relative z-[10002]"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold transition-all duration-200 relative z-[10002]"
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const UserDropdown = () => {
    if (!showDropdown || !isLoggedIn) return null

    return (
      <div className="absolute top-full right-0 mt-2 w-48 bg-cream border border-gold/20 rounded-lg shadow-lg z-[100]">
        <div className="p-2">
          <button
            onClick={() => {
              setShowDropdown(false)
              // Navigation vers la gestion du planning
              window.location.href = "/planning"
            }}
            className="w-full text-left px-3 py-2 text-charcoal hover:bg-rose/20 rounded-md transition-colors flex items-center gap-2"
          >
            <Calendar size={16} />
            Gestion du planning
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-charcoal hover:bg-rose/20 rounded-md transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (isLoggedIn) {
            setShowDropdown(!showDropdown)
          } else {
            setIsLoginModalOpen(true)
          }
        }}
        className={`
          w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold/80 
          hover:from-gold/90 hover:to-gold/70 
          flex items-center justify-center 
          shadow-lg hover:shadow-xl 
          transition-all duration-200 hover:scale-105
          border-2 border-cream/20
          focus:outline-none focus:ring-2 focus:ring-gold/50
          relative z-10
          ${isLoggedIn ? "ring-2 ring-gold/30" : ""}
          ${className}
        `}
        aria-label={isLoggedIn ? "Menu utilisateur" : "Connexion utilisateur"}
      >
        <User size={18} className="text-charcoal" />
        {isLoggedIn && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-cream"></div>
        )}
      </button>

      <UserDropdown />
      <LoginModal />
    </div>
  )
}
