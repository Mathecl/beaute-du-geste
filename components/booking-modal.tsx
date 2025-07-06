"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calendar, Clock } from "lucide-react"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  // Générer les dates pour les 30 prochains jours
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Vérifier si un jour est fermé (dimanche = 0, lundi = 1)
  const isClosedDay = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 1 // Dimanche ou Lundi
  }

  // Générer les créneaux horaires (9h-18h, tranches de 90min)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour += 1.5) {
      const wholeHour = Math.floor(hour)
      const minutes = (hour % 1) * 60
      const timeString = `${wholeHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      slots.push(timeString)
    }
    return slots
  }

  const handleConfirmBooking = () => {
    setIsConfirmed(true)
    setTimeout(() => {
      onClose()
      setIsConfirmed(false)
      setSelectedDate(null)
      setSelectedTime(null)
    }, 2000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ paddingTop: "80px" }}>
      {/* Backdrop amélioré */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal avec animation - centrée par rapport au viewport moins la navbar */}
      <Card className="relative w-full max-w-md bg-cream border-gold/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 max-h-[calc(90vh-80px)] overflow-y-auto z-[10000]">
        <CardHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-charcoal hover:text-gold transition-colors z-[10001] p-1 hover:bg-rose/20 rounded-full"
          >
            <X size={20} />
          </button>
          <CardTitle className="text-2xl font-playfair font-bold text-charcoal flex items-center gap-2 pr-12">
            📅 Prendre rendez-vous
          </CardTitle>
          <div className="w-full h-px bg-rose mt-4" />
        </CardHeader>

        <CardContent className="space-y-6 relative z-[10001]">
          {!isConfirmed ? (
            <>
              {/* Sélection de date */}
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Choisir une date
                </h3>
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                    <div key={day} className="text-center font-medium text-charcoal/60 py-2">
                      {day}
                    </div>
                  ))}
                  {generateDates().map((date, index) => {
                    const isClosed = isClosedDay(date)
                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

                    return (
                      <button
                        key={index}
                        onClick={() => !isClosed && !isPast && setSelectedDate(date)}
                        disabled={isClosed || isPast}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all relative z-[10002]
                          ${
                            isClosed || isPast
                              ? "bg-gray-light text-charcoal/40 cursor-not-allowed"
                              : isSelected
                                ? "bg-charcoal text-cream"
                                : "bg-rose/30 text-charcoal hover:bg-gold/30 hover:scale-105"
                          }
                        `}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sélection d'heure */}
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Créneaux disponibles
                  </h3>
                  <p className="text-sm text-charcoal/70 mb-3">{formatDate(selectedDate)}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {generateTimeSlots().map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-2 px-3 rounded-lg text-sm font-medium transition-all relative z-[10002]
                          ${
                            selectedTime === time
                              ? "bg-charcoal text-cream"
                              : "bg-rose text-charcoal hover:bg-gold hover:scale-105"
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton de confirmation */}
              {selectedDate && selectedTime && (
                <div className="pt-4 border-t border-gray-light">
                  <Button
                    onClick={handleConfirmBooking}
                    className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-3 transition-all relative z-[10002]"
                  >
                    Confirmer le rendez-vous
                  </Button>
                  <p className="text-xs text-charcoal/60 text-center mt-3">
                    La confirmation sera disponible dans votre espace personnel
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Confirmation */
            <div className="text-center py-8 relative z-[10002]">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-playfair font-bold text-charcoal mb-2">Rendez-vous confirmé !</h3>
              <p className="text-charcoal/70 mb-4">
                {selectedDate && formatDate(selectedDate)} à {selectedTime}
              </p>
              <p className="text-sm text-charcoal/60">Vous recevrez une confirmation dans votre espace personnel</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
