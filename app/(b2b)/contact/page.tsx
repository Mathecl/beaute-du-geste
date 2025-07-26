"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Phone, Mail, MapPin, Instagram } from "lucide-react"
import { Logo } from "@/components/logo"
import { appContext } from "@/types/appContext"
import { Toast } from "primereact/toast"

export default function ContactPage() {
  const toast = useRef<Toast>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    serviceType: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { firstName, lastName, email, phone } = formData

    // Validation des champs requis
    if (!firstName || !lastName || !email || !phone) {
      toast.current?.show({
        severity: "warn",
        summary: "Champs manquants",
        detail: "Tous les champs marqués d’un * sont obligatoires.",
        life: 4000,
      })
      return
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isEmailValid) {
      toast.current?.show({
        severity: "error",
        summary: "Email invalide",
        detail: "Veuillez entrer une adresse email valide.",
        life: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${appContext.appUrl}/api/sendContactEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsSubmitted(true)
        toast.current?.show({
          severity: "success",
          summary: "Message envoyé",
          detail: "Votre message a bien été envoyé.",
          life: 4000,
        })

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          serviceType: "",
        })
      } else {
        throw new Error()
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Une erreur est survenue, veuillez réessayer.",
        life: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Toast ref={toast} />

      {/* Header */}
      <header className="bg-cream border-b border-gray-light py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Logo size="md" />
          <h1 className="text-3xl font-playfair font-bold text-charcoal">Contact & Devis</h1>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-gold text-charcoal hover:bg-gold/10 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Retour au site
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informations de contact */}
          <Card className="bg-cream border-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair font-bold text-charcoal">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="text-gold" size={20} />
                  <span className="text-charcoal">06 12 34 56 78</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-gold" size={20} />
                  <span className="text-charcoal">contact@beaute-dugeste.fr</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Instagram className="text-gold" size={20} />
                  <span className="text-charcoal">@beautedugeste</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="text-gold" size={20} />
                  <span className="text-charcoal">Marseille | Serre-Chevalier</span>
                </div>
              </div>

              <div className="bg-rose/30 p-6 rounded-lg">
                <h4 className="font-bold text-charcoal mb-2">Horaires</h4>
                <p className="text-charcoal text-sm">
                  Du mardi au samedi
                  <br />
                  9h00 - 19h00
                  <br />
                  Sur rendez-vous uniquement
                </p>
              </div>

              <div className="bg-gold/10 p-6 rounded-lg">
                <h4 className="font-bold text-charcoal mb-2">Délai de réponse</h4>
                <p className="text-charcoal text-sm">
                  Je m'engage à vous répondre dans les 24h pour toute demande de renseignement ou de devis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de contact */}
          <Card className="bg-cream border-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair font-bold text-charcoal">
                Demande de contact & devis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="Prénom *" value={formData.firstName} onChange={handleInputChange} required />
                    <Input name="lastName" placeholder="Nom *" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                  <Input name="email" type="email" placeholder="Adresse email *" value={formData.email} onChange={handleInputChange} required />
                  <Input name="phone" type="tel" placeholder="Numéro de téléphone *" value={formData.phone} onChange={handleInputChange} required />
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-light rounded-md focus:border-gold focus:outline-none bg-cream"
                    required
                  >
                    <option value="">Type de demande *</option>
                    <option value="soin-kobido">Soin Kobido® - Séance unique</option>
                    <option value="forfait-soins">Forfait soins - Plusieurs séances</option>
                    <option value="evenement-prive">Événement privé</option>
                    <option value="autre">Autre demande</option>
                  </select>
                  <Input name="subject" placeholder="Objet de votre demande *" value={formData.subject} onChange={handleInputChange} required />
                  <Textarea
                    name="message"
                    placeholder="Votre message (décrivez vos besoins, vos disponibilités, etc.) *"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-3 transition-all flex items-center gap-2 justify-center"
                  >
                    <Send size={18} />
                    {isLoading ? "Envoi en cours..." : "Envoyer ma demande"}
                  </Button>
                  <p className="text-xs text-charcoal/60 text-center">
                    * Champs obligatoires. Vos données sont traitées de manière confidentielle.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-playfair font-bold text-charcoal mb-2">Message envoyé !</h3>
                  <p className="text-charcoal/70 mb-4">Merci pour votre demande. Je vous répondrai dans les plus brefs délais.</p>
                  <p className="text-sm text-charcoal/60">
                    Vous recevrez une confirmation par email à l'adresse indiquée.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
