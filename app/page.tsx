"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { Phone, Mail, MapPin, Menu, X, MessageSquare, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { BookingModal } from "@/components/booking-modal"
import { UserButton } from "@/components/user-button"
// import { Button } from 'primereact/button';

export default function Home() {
  // ========
  // FRONTEND
  // ========
  // Text color based on device
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

  // Buttons
  // const solutionsRef = useRef(null);
  // const scrollToSolutions = () => {
  //   solutionsRef.current.scrollIntoView({ behavior: 'smooth' });
  // };

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const heroImages = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  // ======
  // ROUTER
  // ======
  const router = useRouter()
  function openSignUp() {
    router.push("/sign")
  }

  // ======
  // PWA SW
  // ======
  let sw: ServiceWorkerContainer | undefined

  if (typeof window !== "undefined") {
    sw = window?.navigator?.serviceWorker
  }

  useEffect(() => {
    if (sw) {
      sw.register("/service-worker.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registration successful with scope: ", registration.scope)
        })
        .catch((err) => {
          console.log("Service Worker registration failed: ", err)
        })
    }
  }, [sw])

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-gray-light">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Logo size="lg" />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => scrollToSection("accueil")}
              className="text-charcoal hover:text-gold transition-colors text-lg font-medium"
            >
              Accueil
            </button>
            <button
              onClick={() => scrollToSection("kobido")}
              className="text-charcoal hover:text-gold transition-colors text-lg font-medium"
            >
              Le soin Kobido
            </button>
            <button
              onClick={() => scrollToSection("tarifs")}
              className="text-charcoal hover:text-gold transition-colors text-lg font-medium"
            >
              Tarifs
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-charcoal hover:text-gold transition-colors text-lg font-medium"
            >
              Contact
            </button>
            <UserButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* <UserButton /> */}
            <button className="text-charcoal" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-cream border-t border-gray-light">
            <div className="container mx-auto px-4 py-6 space-y-6">
              <button
                onClick={() => scrollToSection("accueil")}
                className="block text-charcoal hover:text-gold transition-colors text-lg font-medium"
              >
                Accueil
              </button>
              <button
                onClick={() => scrollToSection("kobido")}
                className="block text-charcoal hover:text-gold transition-colors text-lg font-medium"
              >
                Le soin Kobido
              </button>
              <button
                onClick={() => scrollToSection("tarifs")}
                className="block text-charcoal hover:text-gold transition-colors text-lg font-medium"
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block text-charcoal hover:text-gold transition-colors text-lg font-medium"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="accueil"
        className="relative min-h-screen h-screen max-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Suspense fallback={<p className="text-xl">Chargement des images...</p>}>
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Hero image ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  style={{
                    objectPosition: "center center",
                  }}
                  priority={index === 0}
                  sizes="100vw"
                />
              </Suspense>
            </div>
          ))}
          <div className="absolute inset-0 bg-charcoal/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <div className="mb-8 md:mb-12 flex flex-col items-center">
            <Logo size="hero" variant="light" className="mb-8 md:mb-12" />
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto mb-8 md:mb-12 font-medium px-4">
              Découvrez l'Authentique Kobido®, un soin du visage et du décolleté d'exception qui allie tradition
              japonaise et expertise du geste pour sublimer votre peau et apaiser votre esprit.
            </p>
            {/* <Button
              size="lg"
              onClick={() => scrollToSection("contact")}
              className="bg-gold hover:bg-gold/90 text-charcoal font-semibold shadow-lg rounded-full px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl"
            >
              Prendre soin de soi
            </Button> */}
          </div>
        </div>
      </section>

      {/* Section Kobido */}
      <section id="kobido" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-5xl md:text-6xl font-advent-pro font-bold text-charcoal mb-8">L'Art du Kobido</h2>
              <p className="text-xl text-charcoal leading-relaxed mb-8">
                Le Kobido, littéralement "voie de la beauté ancienne", est un massage facial traditionnel japonais vieux
                de plus de 500 ans. Pratiqué à l'origine dans les cours impériales, ce soin d'exception combine des
                techniques ancestrales pour révéler l'éclat naturel de votre peau.
              </p>
              <p className="text-xl text-charcoal leading-relaxed">
                Chaque geste est pensé pour stimuler la circulation, détendre les muscles faciaux et favoriser la
                régénération cellulaire, offrant un moment de pure détente et de reconnexion avec soi.
              </p>
            </div>
            <div className="relative h-[450px] rounded-lg overflow-hidden">
              <Image src="/dos.jpeg" alt="Soin Kobido traditionnel" fill className="object-cover" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[450px] rounded-lg overflow-hidden md:order-1">
              <Image src="/face.jpeg" alt="Bienfaits du massage facial Kobido" fill className="object-cover" />
            </div>
            <div className="md:order-2">
              <h3 className="text-4xl font-advent-pro font-bold text-charcoal mb-8">Les Bienfaits</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-xl text-charcoal">
                    <strong>Éclat du teint :</strong> Stimulation de la microcirculation pour un teint lumineux et
                    unifié
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-xl text-charcoal">
                    <strong>Détente profonde :</strong> Relâchement des tensions faciales et apaisement de l'esprit
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-xl text-charcoal">
                    <strong>Lissage naturel :</strong> Tonification des muscles pour un effet lifting naturel
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-xl text-charcoal">
                    <strong>Hydratation :</strong> Amélioration de l'élasticité et de la souplesse de la peau
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section décorative zen */}
      <section className="py-20 px-4 bg-gradient-to-b from-cream to-rose/20">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-10 items-center">
            <div className="relative h-56 rounded-lg overflow-hidden">
              <Image src="/huile.jpeg" alt="Gestes délicats" fill className="object-cover" />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-advent-pro font-bold text-charcoal mb-6">L'Art du Toucher</h3>
              <p className="text-charcoal leading-relaxed text-lg">
                Chaque geste est une caresse, chaque mouvement une danse délicate qui réveille la beauté naturelle de
                votre peau.
              </p>
            </div>
            <div className="relative h-56 rounded-lg overflow-hidden">
              <Image src="/dos.jpeg" alt="Sérénité et équilibre" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section id="tarifs" className="py-24 px-4 bg-rose">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-5xl md:text-6xl font-advent-pro font-bold text-charcoal mb-8">Tarifs</h2>
          <p className="text-xl text-charcoal mb-16 font-medium">
            Un moment d'exception pour retrouver éclat et sérénité
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Sukoshi Kobido */}
            <Card className="bg-cream border-gold/20 shadow-lg h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-advent-pro font-bold text-charcoal mb-4">Sukoshi Kobido</h3>
                <div className="text-4xl font-bold text-gold mb-4">70€</div>
                <p className="text-lg text-charcoal mb-6 font-medium">Séance de 30 minutes</p>
                <p className="text-base text-charcoal mb-6 leading-relaxed flex-grow">
                  Un soin dédié principalement aux zones cou et décolleté
                </p>
                <div className="space-y-2 text-sm text-charcoal/80">
                  <p>+ Rituel d'accueil avec Oshibori</p>
                  <p>+ Massage cou et décolleté Authentique Kobido®</p>
                </div>
              </CardContent>
            </Card>

            {/* Futsu Kobido */}
            <Card className="bg-cream border-gold/20 shadow-lg h-full ring-2 ring-gold/30">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-advent-pro font-bold text-charcoal mb-4">Futsu Kobido</h3>
                <div className="text-4xl font-bold text-gold mb-4">120€</div>
                <p className="text-lg text-charcoal mb-6 font-medium">Séance de 60 minutes</p>
                <p className="text-base text-charcoal mb-6 leading-relaxed flex-grow">
                  Un soin dédié principalement au visage
                </p>
                <div className="space-y-2 text-sm text-charcoal/80">
                  <p>+ Rituel d'accueil avec Oshibori</p>
                  <p>+ Massage visage Authentique Kobido®</p>
                  <p>+ Grand lissage</p>
                </div>
              </CardContent>
            </Card>

            {/* Oki Kobido */}
            <Card className="bg-cream border-gold/20 shadow-lg h-full md:col-span-2 lg:col-span-1">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-advent-pro font-bold text-charcoal mb-4">Oki Kobido</h3>
                <div className="text-4xl font-bold text-gold mb-4">170€</div>
                <p className="text-lg text-charcoal mb-6 font-medium">Séance de 90 minutes</p>
                <p className="text-base text-charcoal mb-6 leading-relaxed flex-grow">
                  Un soin dédié aux zones visage, cou et décolleté
                </p>
                <div className="space-y-2 text-sm text-charcoal/80">
                  <p>+ Rituel d'accueil avec Oshibori</p>
                  <p>+ Massage visage, cou et décolleté Authentique Kobido®</p>
                  <p>+ Grand lissage</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-advent-pro font-bold text-charcoal text-center mb-16">Contact</h2>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-advent-pro font-bold text-charcoal mb-8">Prenons contact</h3>
              <div className="space-y-6 mb-10">
                <div className="flex items-center justify-center space-x-4">
                  <Phone className="text-gold" size={24} />
                  <span className="text-charcoal text-lg">06 12 34 56 78</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <Mail className="text-gold" size={24} />
                  <span className="text-charcoal text-lg">contact@beaute-dugeste.fr</span>
                </div>
                <a
                  href="https://www.instagram.com/beautedugeste/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-4 hover:text-gold transition-colors cursor-pointer"
                >
                  <Instagram className="text-gold" size={24} />
                  <span className="text-charcoal text-lg">@beautedugeste</span>
                </a>
                <div className="flex items-center justify-center space-x-4">
                  <MapPin className="text-gold" size={24} />
                  <span className="text-charcoal text-lg">Marseille | Serre-Chevalier, sur rendez-vous</span>
                </div>
              </div>

              <div className="bg-rose/30 p-8 rounded-lg mb-10">
                <h4 className="font-bold text-charcoal mb-3 text-xl">Horaires</h4>
                <p className="text-charcoal text-lg">
                  Du mardi au samedi
                  <br />
                  9h00 - 19h00
                  <br />
                  Sur rendez-vous uniquement
                </p>
              </div>

              <Button
                onClick={() => (window.location.href = "/contact")}
                className="bg-gold hover:bg-gold/90 text-charcoal font-semibold shadow-lg px-10 py-4 text-xl flex items-center gap-3 mx-auto"
              >
                <MessageSquare size={24} />
                Demande de contact & devis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-cream py-10 px-4">
        <div className="container mx-auto text-center">
          <p className="text-base">© 2025 Beauté du Geste. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Floating CTA Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          size="lg"
          className="bg-gold hover:bg-gold/90 text-charcoal font-semibold shadow-lg rounded-full px-8 py-4 text-lg"
          onClick={() => scrollToSection("contact")}
        >
          Prendre soin de soi
        </Button>
      </div>

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  )
}
