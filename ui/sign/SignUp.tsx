"use client"
import type React from "react"
import { useRef, useState, type ChangeEvent } from "react"
import { appContext } from "@/types/appContext"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Lock, Building, MapPin, Eye, EyeOff, CheckCircle, Key } from "lucide-react"
import { Toast } from "primereact/toast"
import { useRouter } from "next/navigation"

interface Users {
  users: {
    id: string
    userName: string
    userEmail: string
    userPassword: string
    companyName: string
    city: string
  }[]
}

interface FormData {
  id: string
  userName: string
  userEmail: string
  userPassword: string
  companyName: string
  city: string
}

interface City {
  value: string
  label: string
}

const SignUp = ({ users }: Users) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyNameFromSearchParam = searchParams?.get("company")?.replace(/\s/g, "")

  const toast = useRef<Toast>(null)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const [isModalButtonLoading, setIsModalButtonLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form data
  const [checkUserName, setCheckUserName] = useState("")
  const [checkUserEmail, setCheckUserEmail] = useState("")
  const [checkUserPwd, setCheckUserPwd] = useState("")
  const [checkCompanyName, setCheckCompanyName] = useState("")
  const [checkCity, setCheckCity] = useState("")

  const cities: City[] = [
    { value: "Paris", label: "Paris" },
    { value: "Marseille", label: "Marseille" },
    { value: "Lyon", label: "Lyon" },
    { value: "Toulouse", label: "Toulouse" },
    { value: "Nice", label: "Nice" },
    { value: "Nantes", label: "Nantes" },
    { value: "Montpellier", label: "Montpellier" },
    { value: "Strasbourg", label: "Strasbourg" },
    { value: "Bordeaux", label: "Bordeaux" },
    { value: "Lille", label: "Lille" },
    { value: "Rennes", label: "Rennes" },
    { value: "Reims", label: "Reims" },
    { value: "Toulon", label: "Toulon" },
    { value: "Saint-Etienne", label: "Saint-Etienne" },
    { value: "Le Havre", label: "Le Havre" },
    { value: "Dijon", label: "Dijon" },
    { value: "Grenoble", label: "Grenoble" },
    { value: "Villeurbanne", label: "Villeurbanne" },
    { value: "Saint-Denis (La Réunion)", label: "Saint-Denis (La Réunion)" },
  ]

  // App Context
  const createUserUrl: string = appContext.appUrl + "/api/createUser"
  const manageVerificationUrl: string = appContext.appUrl + "/api/manageVerification"

  // Modal and verification
  const [modalVis, setModalVis] = useState(false)
  const [storedEmail, setStoredEmail] = useState("")
  const [state, setState] = useState({ value: "" })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ value: event?.target?.value })
  }

  const comparePinCode = async () => {
    const filledPinCode: string = state.value
    const dataToVerify: string = `${filledPinCode},${storedEmail},${checkUserName},${checkCompanyName},${checkCity}`

    fetch(manageVerificationUrl, {
      body: JSON.stringify(dataToVerify),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
    }).then((res) => {
      var stringifiedRes = JSON.stringify(res.ok)
      if (stringifiedRes == "true") {
        toast.current?.show({
          severity: "success",
          summary: "Vérification réussie",
          detail: "Le code PIN est correct",
          life: 5000,
        })
        setModalVis(false)
        router.replace(appContext.appUrl + "/sign")
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Code incorrect",
          detail: "Le code PIN entré est incorrect",
          life: 5000,
        })
      }
    })
  }

  const handleModal = async () => {
    try {
      setIsModalButtonLoading(true)
      await comparePinCode()
      setIsModalButtonLoading(false)
    } catch (error) {
      setIsModalButtonLoading(false)
      return error
    }
  }

  async function create(data: FormData) {
    try {
      fetch(createUserUrl, {
        body: JSON.stringify({
          email: data.userEmail,
          password: data.userPassword,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
      }).then(() =>
        setForm({
          id: "",
          userName: "",
          userEmail: "",
          userPassword: "",
          companyName: "",
          city: "",
        }),
      )
    } catch (error) {
      return error
    }
  }

  const [form, setForm] = useState<FormData>({
    id: "",
    userName: "",
    userEmail: "",
    userPassword: "",
    companyName: "",
    city: "",
  })

  function checkForm(data: FormData) {
    setCheckUserName(data.userName)
    setCheckUserEmail(data.userEmail)
    setCheckUserPwd(data.userPassword)
    setCheckCompanyName(data.companyName)
    setCheckCity(data.city)
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true)
      checkForm(data)
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
      await sleep(1000)

      if (
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.userEmail) &&
        /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})./.test(
          data.userPassword,
        )
      ) {
        await sleep(1000)
        setStoredEmail(data.userEmail)
        await create(data)
        setModalVis(true)
        await sleep(2000)
        setIsButtonLoading(false)
        toast.current?.show({
          severity: "info",
          summary: "Vérification requise",
          detail: "Veuillez vérifier votre adresse e-mail avec le code reçu",
          sticky: true,
        })
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Erreur de validation",
          detail: "Veuillez vérifier que tous les champs sont correctement remplis",
          life: 5000,
        })
        setModalVis(false)
        setIsButtonLoading(false)
      }
    } catch (error) {
      setIsButtonLoading(false)
      return error
    }
  }

  // Auto-fill company name from search params
  if (companyNameFromSearchParam && companyNameFromSearchParam !== null && companyNameFromSearchParam !== undefined) {
    form.companyName = companyNameFromSearchParam
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Toast ref={toast} />

      {/* Verification Modal */}
      <Dialog open={modalVis} onOpenChange={setModalVis}>
        <DialogContent className="bg-cream border-gold/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-advent-pro font-bold text-charcoal text-center">
              Vérification de votre compte
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 p-6">
            <div className="bg-gold/10 p-6 rounded-lg">
              <h4 className="font-semibold text-charcoal mb-3 text-xl">Résumé de votre inscription :</h4>
              <div className="text-lg text-charcoal/70">
                <p>
                  <strong>Nom :</strong> {checkUserName}
                </p>
                <p>
                  <strong>Email :</strong> {checkUserEmail}
                </p>
                <p>
                  <strong>Entreprise :</strong> {checkCompanyName}
                </p>
                <p>
                  <strong>Ville :</strong> {checkCity}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="pincode" className="text-lg font-medium text-charcoal">
                Code de vérification
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
                <Input
                  id="pincode"
                  value={state.value}
                  onChange={handleChange}
                  className="pl-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream"
                  placeholder="Entrez le code reçu par email"
                  required
                />
              </div>
              <p className="text-base text-charcoal/60">
                Ce code PIN est à conserver car il pourra vous être demandé ultérieurement pour certaines
                fonctionnalités.
              </p>
            </div>

            <Button
              onClick={handleModal}
              disabled={isModalButtonLoading}
              className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-4 text-lg transition-all rounded-full"
            >
              {isModalButtonLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                  Vérification en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  Accéder à Beauté du Geste
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(form)
        }}
        className="space-y-6"
        method="POST"
      >
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="userName" className="text-lg font-medium text-charcoal">
            Prénom et nom
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <Input
              id="userName"
              value={form.userName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, userName: e.target.value })}
              className="pl-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream"
              placeholder="Jean Dupont"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="userEmail" className="text-lg font-medium text-charcoal">
            Adresse email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <Input
              id="userEmail"
              type="email"
              value={form.userEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, userEmail: e.target.value })}
              className="pl-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream"
              placeholder="jean@example.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="userPassword" className="text-lg font-medium text-charcoal">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <Input
              id="userPassword"
              type={showPassword ? "text" : "password"}
              value={form.userPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, userPassword: e.target.value })}
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
          <div className="bg-rose/20 p-3 rounded-lg">
            <p className="text-sm text-charcoal/70">
              <strong>Exigences :</strong> Au moins 6 caractères avec une majuscule, une minuscule et un chiffre
            </p>
          </div>
        </div>

        {/* Company Name Field */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-lg font-medium text-charcoal">
            Nom d'entreprise
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50" size={20} />
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="pl-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream"
              placeholder="Votre entreprise"
              required
            />
          </div>
        </div>

        {/* City Field */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-lg font-medium text-charcoal">
            Ville
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 z-10" size={20} />
            <Select value={form.city} onValueChange={(value) => setForm({ ...form, city: value })} required>
              <SelectTrigger className="pl-12 py-4 text-lg border-gray-light focus:border-gold focus:ring-gold/20 bg-cream">
                <SelectValue placeholder="Sélectionnez votre ville" />
              </SelectTrigger>
              <SelectContent className="bg-cream border-gold/30">
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value} className="text-lg">
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-rose/20 p-4 rounded-lg">
          <p className="text-base text-charcoal/70 text-center">
            En créant votre compte, vous acceptez nos{" "}
            <Link href="/cgu" className="text-gold hover:text-gold/80 font-medium transition-colors">
              Conditions Générales d'Utilisation
            </Link>{" "}
            et notre politique de confidentialité.
          </p>
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
              Création en cours...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              Créer mon compte
            </div>
          )}
        </Button>

        {/* Welcome Message */}
        <div className="bg-gold/10 p-4 rounded-lg">
          <p className="text-base text-charcoal text-center">
            <strong>Bienvenue dans l'univers Beauté du Geste !</strong>
            <br />
            Découvrez l'art du Kobido et prenez soin de vous avec nos soins d'exception.
          </p>
        </div>
      </form>
    </div>
  )
}

export default SignUp
