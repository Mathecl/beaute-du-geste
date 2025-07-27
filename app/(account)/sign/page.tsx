"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import SignIn from "@/ui/sign/SignIn"
import SignUp from "@/ui/sign/SignUp"

export default function Sign() {
  const [signUp, setSignUp] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState(false)

  function displaySignUp() {
    try {
      setSignUp(true)
    } catch (error) {
      return error
    }
  }

  function displaySignIn() {
    try {
      setSignUp(false)
    } catch (error) {
      return error
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      if (typeof window != undefined) {
        if (mobileRegex.test(userAgent)) {
          setIsMobile(true)
        } else {
          setIsMobile(false)
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-cream border-b border-gray-light py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Logo size="md" />
          <h1 className="text-4xl font-advent-pro font-bold text-charcoal">Connexion</h1>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-gold text-charcoal hover:bg-gold/10 flex items-center gap-2 text-lg px-6 py-3"
          >
            <ArrowLeft size={18} />
            Retour au site
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-2xl">
            {/* Video Background for Desktop */}
            {!isMobile && (
              <div className="fixed inset-0 z-0 opacity-20">
                <Suspense fallback={<div className="text-xl text-charcoal">Chargement...</div>}>
                  {/* <image autoPlay muted loop playsInline className="w-full h-full object-cover">
                    <source src="/video/sign.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </image> */}
                  <Image src="/hero1.jpg" alt="Bienfaits du Kobido" fill className="w-full h-full object-cover" />
                </Suspense>
              </div>
            )}

            {/* Main Card */}
            <Card className="relative z-10 bg-cream/95 backdrop-blur-sm border-gold/30 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center space-x-4 mb-8">
                  <Button
                    onClick={displaySignUp}
                    variant={signUp ? "default" : "outline"}
                    className={`px-8 py-3 text-lg font-semibold rounded-full transition-all ${
                      signUp ? "bg-gold hover:bg-gold/90 text-charcoal" : "border-gold text-charcoal hover:bg-gold/10"
                    }`}
                  >
                    Connexion
                  </Button>
                  <Button
                    onClick={displaySignIn}
                    variant={!signUp ? "default" : "outline"}
                    className={`px-8 py-3 text-lg font-semibold rounded-full transition-all ${
                      !signUp ? "bg-gold hover:bg-gold/90 text-charcoal" : "border-gold text-charcoal hover:bg-gold/10"
                    }`}
                  >
                    Inscription
                  </Button>
                </div>
                <CardTitle className="text-3xl font-advent-pro font-bold text-charcoal">
                  {signUp ? "Bienvenue" : "Créer un compte"}
                </CardTitle>
                <p className="text-lg text-charcoal/70 mt-2">
                  {signUp
                    ? "Connectez-vous pour accéder à votre espace personnel"
                    : "Rejoignez-nous pour découvrir l'art du Kobido"}
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">{signUp ? <SignIn /> : <SignUp />}</div>
              </CardContent>
            </Card>

            {/* Logo for Mobile */}
            {isMobile && (
              <div className="mt-12 text-center">
                <Suspense fallback={<div className="text-lg text-charcoal">Chargement de l'image...</div>}>
                  <Image
                    src="/images/logo.png"
                    width={200}
                    height={200}
                    alt="Logo"
                    className="mx-auto rounded-xl opacity-80"
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
