'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Suspense } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Phone, Mail, MapPin, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { BookingModal } from "@/components/booking-modal"
import { UserButton } from "@/components/user-button"
// import { Button } from 'primereact/button';

export default function Home() {
  // ========
  // FRONTEND
  // ========
  // Text color based on device
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Check if the window object is available (i.e., we are in a browser environment)
    if (typeof window !== 'undefined') {
      // Access the user-agent string from the window.navigator object
      const userAgent = window.navigator.userAgent;
      // console.log('user agent:', JSON.stringify(userAgent));

      // Define regular expressions to match common mobile device types
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

      // Use the test method to check if the user-agent string matches any of the mobile device patterns
      if (typeof window != undefined) {
        if (mobileRegex.test(userAgent)) {
          setIsMobile(true);
        } else {
          setIsMobile(false);
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
  }, []);

  // Buttons
  // const solutionsRef = useRef(null);
  // const scrollToSolutions = () => {
  //   solutionsRef.current.scrollIntoView({ behavior: 'smooth' });
  // };

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const heroImages = ["/hero  1.jpg", "/hero2.jpg", "/hero3.jpg"]

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
  const router = useRouter();
  function openSignUp() {
    router.push('/sign');
  }

  // ======
  // PWA SW
  // ======
  let sw: ServiceWorkerContainer | undefined;

  if (typeof window !== 'undefined') {
    sw = window?.navigator?.serviceWorker;
  }

  useEffect(() => {
    if (sw) {
      sw.register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log(
            'Service Worker registration successful with scope: ',
            registration.scope,
          );
        })
        .catch((err) => {
          console.log('Service Worker registration failed: ', err);
        });
    }
  }, [sw]);

  return (
    <div className="min-h-screen bg-cream">
    {/* Navigation */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-gray-light">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo size="sm" />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection("accueil")}
            className="text-charcoal hover:text-gold transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => scrollToSection("kobido")}
            className="text-charcoal hover:text-gold transition-colors"
          >
            Le soin Kobido
          </button>
          <button
            onClick={() => scrollToSection("tarifs")}
            className="text-charcoal hover:text-gold transition-colors"
          >
            Tarifs
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-charcoal hover:text-gold transition-colors"
          >
            Contact
          </button>
          <UserButton />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <UserButton />
          <button className="text-charcoal" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-cream border-t border-gray-light">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <button
              onClick={() => scrollToSection("accueil")}
              className="block text-charcoal hover:text-gold transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => scrollToSection("kobido")}
              className="block text-charcoal hover:text-gold transition-colors"
            >
              Le soin Kobido
            </button>
            <button
              onClick={() => scrollToSection("tarifs")}
              className="block text-charcoal hover:text-gold transition-colors"
            >
              Tarifs
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block text-charcoal hover:text-gold transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>

    {/* Hero Section */}
    <section id="accueil" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Suspense fallback={<p>Chargement des images...</p>}>
              <Image
                src={image || "/placeholder.svg"}
                alt={`Hero image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </Suspense>
          </div>
        ))}
        <div className="absolute inset-0 bg-charcoal/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col items-center">
          <Logo size="hero" variant="light" className="mb-8" />
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            Découvrez l'art du Kobido, un soin du visage d'exception qui allie tradition japonaise et gestes intuitifs
            pour sublimer votre peau et apaiser votre esprit.
          </p>
          <Button
            size="lg"
            onClick={() => setIsBookingModalOpen(true)}
            className="bg-gold hover:bg-gold/90 text-charcoal font-semibold shadow-lg rounded-full px-8 py-4 text-lg"
          >
            Prendre soin de soi
          </Button>
        </div>
      </div>
    </section>

    {/* Section Kobido */}
    <section id="kobido" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-6">L'Art du Kobido</h2>
            <p className="text-lg text-charcoal leading-relaxed mb-6">
              Le Kobido, littéralement "voie de la beauté ancienne", est un massage facial traditionnel japonais vieux
              de plus de 500 ans. Pratiqué à l'origine dans les cours impériales, ce soin d'exception combine des
              techniques ancestrales pour révéler l'éclat naturel de votre peau.
            </p>
            <p className="text-lg text-charcoal leading-relaxed">
              Chaque geste est pensé pour stimuler la circulation, détendre les muscles faciaux et favoriser la
              régénération cellulaire, offrant un moment de pure détente et de reconnexion avec soi.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image src="/dos.jpeg" alt="Soin Kobido traditionnel" fill className="object-cover" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-lg overflow-hidden md:order-1">
            <Image
              src="/face.jpeg"
              alt="Bienfaits du massage facial Kobido"
              fill
              className="object-cover"
            />
          </div>
          <div className="md:order-2">
            <h3 className="text-3xl font-playfair font-bold text-charcoal mb-6">Les Bienfaits</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-charcoal">
                  <strong>Éclat du teint :</strong> Stimulation de la microcirculation pour un teint lumineux et
                  unifié
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-charcoal">
                  <strong>Détente profonde :</strong> Relâchement des tensions faciales et apaisement de l'esprit
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-charcoal">
                  <strong>Lissage naturel :</strong> Tonification des muscles pour un effet lifting naturel
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gold rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-lg text-charcoal">
                  <strong>Hydratation :</strong> Amélioration de l'élasticité et de la souplesse de la peau
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Section décorative zen */}
    <section className="py-16 px-4 bg-gradient-to-b from-cream to-rose/20">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image src="/huile.jpeg" alt="Gestes délicats" fill className="object-cover" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-playfair font-bold text-charcoal mb-4">L'Art du Toucher</h3>
            <p className="text-charcoal leading-relaxed">
              Chaque geste est une caresse, chaque mouvement une danse délicate qui réveille la beauté naturelle de
              votre peau.
            </p>
          </div>
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image src="/dos.jpeg" alt="Sérénité et équilibre" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>

    {/* Section Tarifs */}
    <section id="tarifs" className="py-20 px-4 bg-rose">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-12">Tarifs</h2>

        <Card className="max-w-md mx-auto bg-cream border-gold/20 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-playfair font-bold text-charcoal mb-4">Soin Kobido Complet</h3>
            <div className="text-4xl font-bold text-gold mb-4">85€</div>
            <p className="text-charcoal mb-6 leading-relaxed">
              Séance de 60 minutes incluant un soin complet du visage, du cou et des épaules. Un moment d'exception
              pour retrouver éclat et sérénité.
            </p>
            <div className="space-y-2 text-sm text-charcoal/80">
              <p>• Nettoyage et préparation de la peau</p>
              <p>• Massage Kobido traditionnel</p>
              <p>• Soin du cou et des épaules</p>
              <p>• Masque hydratant personnalisé</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* Section Contact */}
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal text-center mb-12">Contact</h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-playfair font-bold text-charcoal mb-6">Prenons contact</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Phone className="text-gold" size={20} />
                <span className="text-charcoal">06 12 34 56 78</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-gold" size={20} />
                <span className="text-charcoal">contact@beaute-dugeste.fr</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="text-gold" size={20} />
                <span className="text-charcoal">Marseille - Serre-Chevalier, sur rendez-vous</span>
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
          </div>

          <div>
            <h3 className="text-2xl font-playfair font-bold text-charcoal mb-6">Créer un compte</h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input placeholder="Prénom" className="border-gray-light focus:border-gold" />
                </div>
                <div>
                  <Input placeholder="Nom" className="border-gray-light focus:border-gold" />
                </div>
              </div>
              <div>
                <Input type="email" placeholder="Adresse email" className="border-gray-light focus:border-gold" />
              </div>
              <div>
                <Input type="tel" placeholder="Numéro de téléphone" className="border-gray-light focus:border-gold" />
              </div>
              <Button className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold">
                Créer mon compte
              </Button>
              <p className="text-xs text-charcoal/60 text-center mt-3">
                En créant votre compte, vous pourrez réserver vos soins en ligne et accéder à votre espace personnel.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-charcoal text-cream py-8 px-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">© 2025 Beauté du Geste. Tous droits réservés.</p>
      </div>
    </footer>

    {/* Floating CTA Button */}
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        size="lg"
        className="bg-gold hover:bg-gold/90 text-charcoal font-semibold shadow-lg rounded-full px-6 py-3"
        onClick={() => setIsBookingModalOpen(true)}
      >
        Prendre soin de soi
      </Button>
    </div>

    {/* Booking Modal */}
    <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
  </div>
    // <div>
    //   <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
    //     <main className="flex-1">
    //       <section className="relative w-full py-4 md:py-8 lg:py-12 xl:py-24 2xl:py-32">
    //         <div className="container px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10">
    //           <div className="grid grid-cols-1 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-2 xl:gap-8 2xl:grid-cols-2 2xl:gap-12">
    //             <div className="flex flex-col justify-center space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
    //               <div className="h-full w-full space-y-1 rounded rounded-md border border-gray-800 bg-[#79018c] bg-opacity-20 bg-clip-padding p-5 shadow-md backdrop-blur-sm backdrop-filter md:space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-5">
    //                 <h1
    //                   className={`${
    //                     isMobile ? 'text-dark' : 'text-white'
    //                   } text-xl font-bold tracking-tighter md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl`}
    //                 >
    //                   <span style={{ color: '#00fc71' }}>Beauté du geste</span>,
    //                   c'est l'avenir de la gestion
    //                   <br />
    //                   d'entreprise à portée de clic.
    //                 </h1>
    //                 <br />
    //                 <button onClick={openSignUp}>S'inscrire</button>
    //                 <button onClick={scrollToSolutions}>En savoir plus</button>
    //               </div>
    //             </div>
    //             <div className="flex flex-col justify-between">
    //               <div className="relative aspect-[16/9]">
    //                 <Suspense fallback={<p>Chargement de la video...</p>}>
    //                   <video
    //                     src="/video/accueilAnimation.mp4"
    //                     className="absolute inset-0 h-full w-full object-cover"
    //                     loop
    //                     autoPlay
    //                     muted
    //                   />
    //                 </Suspense>
    //               </div>
    //               <br />
    //               {/* <div className="space-y-1 md:space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-5">
    //                 <h2
    //                   className={`${
    //                     isMobile ? 'text-dark' : 'text-white'
    //                   } text-lg font-bold tracking-tighter md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl`}
    //                 >
    //                   Notre engagement repose sur la{' '}
    //                   <span style={{ color: '#00fc71' }}>transparence</span>, la{' '}
    //                   <br />
    //                   <span style={{ color: '#00fc71' }}>
    //                     responsabilité
    //                   </span>{' '}
    //                   et la <span style={{ color: '#00fc71' }}>générosité</span>
    //                   .
    //                 </h2>
    //                 <p
    //                   className={`${
    //                     isMobile ? 'text-dark' : 'text-white'
    //                   } max-w-[600px] md:text-lg lg:text-xl 2xl:text-3xl/relaxed`}
    //                 >
    //                   Unigate s'engage à être un modèle de changement social
    //                   positif, en utilisant la technologie pour améliorer les
    //                   entreprises et la société dans son ensemble. Nous croyons
    //                   en un avenir où le succès économique va de pair avec la
    //                   responsabilité sociale, et nous sommes déterminés à
    //                   incarner cette vision.
    //                 </p>
    //               </div> */}
    //             </div>
    //           </div>
    //         </div>
    //       </section>

    //       {/* ---- */}

    //       <section className="bg-white dark:bg-gray-900">
    //         <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-16 lg:px-6">
    //           <div className="mx-auto max-w-screen-sm text-center">
    //             <h2 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
    //               Commençons à collaborer ensemble
    //             </h2>
    //             <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
    //               Essayez gratuitement Beauté du geste
    //             </p>
    //             <button onClick={openSignUp}>Commencer</button>
    //           </div>
    //         </div>
    //       </section>
    //     </main>
    //   </div>
    // </div>
  );
}
