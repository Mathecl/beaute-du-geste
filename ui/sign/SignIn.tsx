"use client"
import { useState, useRef } from "react"
import supabase from "@/utils/supabase/supabaseClient"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react"
import { Toast } from "primereact/toast"

interface Users {
  users: {
    userEmail: string
    userPassword: string
    id: string
  }[]
}

interface FormData {
  userEmail: string
  userPassword: string
  id: string
}

const SignIn = ({ users }: Users) => {
  const searchParams = useSearchParams()
  const toast = useRef<Toast>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)

  const showError = () => {
    toast.current?.show({
      severity: "error",
      summary: "Erreur de connexion",
      detail: "Veuillez vérifier votre email et/ou mot de passe",
      life: 4000,
    })
  }

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Connexion réussie",
      detail: "Vous êtes maintenant connecté(e)",
      life: 3000,
    })
  }

  const [form, setForm] = useState<FormData>({
    userEmail: "",
    userPassword: "",
    id: "",
  })

  async function create(data: FormData) {
    const { userEmail, userPassword } = data

    if (userEmail.length > 6 && userPassword.length >= 6 && userEmail.includes("@") && userEmail.includes(".")) {
      setIsButtonLoading(true)

      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      })

      setIsButtonLoading(false)

      if (error) {
        console.error("Erreur de connexion :", error.message)
        showError()
      } else if (signInData?.user) {
        showSuccess()
        window.location.replace("/profile")
      }
    } else {
      showError()
    }
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true)
      await create(data)
      setIsButtonLoading(false)
    } catch (error) {
      setIsButtonLoading(false)
      return error
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Toast ref={toast} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(form)
        }}
        className="space-y-6"
        method="POST"
      >
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-lg font-medium text-charcoal">
            Adresse email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <Input
              id="email"
              type="email"
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              className="pl-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream"
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-lg font-medium text-charcoal">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.userPassword}
              onChange={(e) => setForm({ ...form, userPassword: e.target.value })}
              className="pl-12 pr-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 hover:text-charcoal transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-center">
          <Link href="/resetpassword" className="text-lg text-gold hover:text-gold/80 font-medium transition-colors">
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isButtonLoading}
          className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-4 text-lg transition-all rounded-full"
        >
          {isButtonLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
              Connexion en cours...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              Se connecter
            </div>
          )}
        </Button>

        {/* Additional Info */}
        <div className="bg-rose/20 p-4 rounded-lg">
          <p className="text-base text-charcoal/70 text-center">
            Première visite ?{" "}
            <span className="font-medium text-charcoal">Créez votre compte pour réserver vos séances Kobido</span>
          </p>
        </div>
      </form>
    </div>
  )
}

export default SignIn
