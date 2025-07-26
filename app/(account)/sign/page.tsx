"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"

import Image from "next/image"

import { Button } from "primereact/button"

import SignIn from "@/ui/sign/SignIn.tsx"
import SignUp from "@/ui/sign/SignUp.tsx"
// import '@/styles/sign.css';

export default function Sign() {
  const [signUp, setSignUp] = useState<boolean>(true)

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

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if the window object is available (i.e., we are in a browser environment)
    if (typeof window !== "undefined") {
      // Access the user-agent string from the window.navigator object
      const userAgent = window.navigator.userAgent
      // console.log('user agent:', JSON.stringify(userAgent));

      // Define regular expressions to match common mobile device types
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      // Use the test method to check if the user-agent string matches any of the mobile device patterns
      if (typeof window != undefined) {
        if (mobileRegex.test(userAgent)) {
          setIsMobile(true)
        } else {
          setIsMobile(false)
        }
      }
    }

    // const innerWidth = window.innerWidth;
    // if (typeof window != undefined) {
    //   if (innerWidth <= 640) {
    //     setIsMobile(true);
    //   } else {
    //     setIsMobile(false);
    //   }
    // }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center gap-4 md:justify-between">
      {/* Video (background) */}
      {isMobile != true && (
        <div className="video-container z-0">
          <Suspense fallback={<p className="text-lg">Chargement de la vidéo...</p>}>
            <video autoPlay muted loop playsInline>
              <source src="/video/sign.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Suspense>
        </div>
      )}

      {/* Sign in, sign up form (left) */}
      {isMobile !== true ? (
        <div
          className="z-1 text-card-foreground formWidth ml-8 h-max rounded-lg border border-gray-800 bg-[#79018c] bg-opacity-30 bg-clip-padding p-6 shadow-md backdrop-blur-sm backdrop-filter md:w-1/3"
          data-v0-t="card"
        >
          <div className="w-full text-center">
            <Button
              label="Connexion"
              rounded
              onClick={displaySignUp}
              className="mr-3 text-lg px-6 py-3"
              pt={{
                root: { className: "bg-green-500 border-green-500 text-lg" },
              }}
            />
            <Button
              label="Inscription"
              rounded
              onClick={displaySignIn}
              className="text-lg px-6 py-3"
              pt={{
                root: { className: "bg-green-500 border-green-500 text-lg" },
              }}
            />
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="space-y-3 pl-8 pr-8 pt-8">{signUp ? <SignIn /> : <SignUp />}</div>
          </div>
        </div>
      ) : (
        <div
          className="z-1 text-card-foreground formWidth h-max rounded-lg border-gray-800 bg-[#79018c] bg-opacity-30 bg-clip-padding p-6 shadow-md backdrop-blur-sm backdrop-filter md:w-1/3"
          data-v0-t="card"
        >
          <div className="w-full text-center">
            <Button
              label="Connexion"
              rounded
              onClick={displaySignUp}
              className="mr-3 text-lg px-6 py-3"
              pt={{
                root: { className: "bg-green-500 border-green-500 text-lg" },
              }}
            />
            <Button
              label="Inscription"
              rounded
              onClick={displaySignIn}
              className="text-lg px-6 py-3"
              pt={{
                root: { className: "bg-green-500 border-green-500 text-lg" },
              }}
            />
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="space-y-3 pl-8 pr-8 pt-8">{signUp ? <SignIn /> : <SignUp />}</div>
          </div>
        </div>
      )}

      {/* Logo (right) */}
      {isMobile != true && (
        <div className="z-1 w-full md:w-2/3">
          <Suspense fallback={<p className="text-lg">Chargement de l'image...</p>}>
            <Image
              src="/images/logo.png"
              width={700}
              height={700}
              alt="Logo"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center lg:order-last"
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
