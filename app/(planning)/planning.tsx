"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Check, X, Sun, Moon, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Logo } from "@/components/logo"

interface TimeSlot {
  time: string
  available: boolean
}

export default function PlanningManagement() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { time: "09:00", available: true },
    { time: "10:30", available: true },
    { time: "12:00", available: true },
    { time: "13:30", available: true },
    { time: "15:00", available: true },
    { time: "16:30", available: true },
    { time: "18:00", available: true },
  ])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6)) // Juillet 2025 (mois 6 = juillet)
  const [actionSelected, setActionSelected] = useState(false)

  // Ajouter ces fonctions après la déclaration des states
  const isMorningOpen = () => {
    return timeSlots.some((slot) => {
      const hour = Number.parseInt(slot.time.split(":")[0])
      return hour <= 12 && slot.available
    })
  }

  const isAfternoonOpen = () => {
    return timeSlots.some((slot) => {
      const hour = Number.parseInt(slot.time.split(":")[0])
      return hour > 12 && slot.available
    })
  }

  const isFullDayOpen = () => {
    return timeSlots.some((slot) => slot.available)
  }

  const generateDates = () => {
    const dates = []
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Ajouter les jours vides du début du mois
    const startDay = firstDay.getDay()
    for (let i = 0; i < startDay; i++) {
      dates.push(null)
    }

    // Ajouter tous les jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      dates.push(date)
    }
    return dates
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
    setSelectedDate(null)
    setSelectedDates([])
    setActionSelected(false) // Reset l'état d'action
  }

  const navigateDay = (direction: "prev" | "next") => {
    if (!selectedDate) return

    const newDate = new Date(selectedDate)

    do {
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 1)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
    } while (isClosedDay(newDate))

    setSelectedDate(newDate)

    // Si on change de mois, mettre à jour le mois affiché
    if (newDate.getMonth() !== currentMonth.getMonth() || newDate.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth()))
    }
  }

  const goToToday = () => {
    const today = new Date(2025, 6, 3) // 3 juillet 2025
    setSelectedDate(today)

    // Mettre à jour le mois si nécessaire
    if (today.getMonth() !== currentMonth.getMonth() || today.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth()))
    }
  }

  const goToCurrentMonth = () => {
    const today = new Date(2025, 6, 3) // 3 juillet 2025
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth()))
    setSelectedDate(null)
    setSelectedDates([])
    setActionSelected(false)
  }

  const getMonthName = () => {
    return currentMonth.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
  }

  const toggleDateSelection = (date: Date) => {
    const dateString = date.toDateString()
    const isSelected = selectedDates.some((d) => d.toDateString() === dateString)

    if (isSelected) {
      setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateString))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  const clearSelection = () => {
    setSelectedDates([])
    setActionSelected(false)
  }

  const setDefaultSchedule = () => {
    // Ouvrir tous les créneaux par défaut
    const newTimeSlots = timeSlots.map((slot) => ({ ...slot, available: true }))
    setTimeSlots(newTimeSlots)
    console.log(`Mise par défaut appliquée sur ${selectedDates.length} dates`)
    setActionSelected(true)
  }

  const toggleTimeSlot = (index: number) => {
    const newTimeSlots = [...timeSlots]
    newTimeSlots[index].available = !newTimeSlots[index].available
    setTimeSlots(newTimeSlots)
  }

  const toggleMorning = () => {
    const morningOpen = isMorningOpen()
    const newTimeSlots = timeSlots.map((slot) => {
      const hour = Number.parseInt(slot.time.split(":")[0])
      if (hour <= 12) {
        return { ...slot, available: !morningOpen }
      }
      return slot
    })
    setTimeSlots(newTimeSlots)
  }

  const toggleAfternoon = () => {
    const afternoonOpen = isAfternoonOpen()
    const newTimeSlots = timeSlots.map((slot) => {
      const hour = Number.parseInt(slot.time.split(":")[0])
      if (hour > 12) {
        return { ...slot, available: !afternoonOpen }
      }
      return slot
    })
    setTimeSlots(newTimeSlots)
  }

  const toggleFullDay = () => {
    const fullDayOpen = isFullDayOpen()
    const newTimeSlots = timeSlots.map((slot) => ({ ...slot, available: !fullDayOpen }))
    setTimeSlots(newTimeSlots)
  }

  const applyToSelectedDates = (action: "morning" | "afternoon" | "fullday") => {
    // Simulation de l'application sur les dates sélectionnées
    console.log(`Application de l'action ${action} sur ${selectedDates.length} dates`)
    setActionSelected(true)
  }

  const saveChanges = () => {
    setShowConfirmation(true)
    setActionSelected(false)
    setTimeout(() => setShowConfirmation(false), 3000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const isClosedDay = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 1 // Dimanche ou Lundi
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => d.toDateString() === date.toDateString())
  }

  const handleDateClick = (date: Date) => {
    if (selectedDates.length > 0) {
      // Si des jours sont déjà sélectionnés, ajouter automatiquement ce jour à la sélection
      toggleDateSelection(date)
    } else {
      // Sinon, comportement normal (sélection d'un jour unique)
      setSelectedDate(date)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-cream border-b border-gray-light py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Logo size="md" />
          <h1 className="text-3xl font-advent-pro font-bold text-charcoal">Gestion du Planning</h1>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-gold text-charcoal hover:bg-gold/10"
          >
            Retour au site
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendrier */}
          <Card className="bg-cream border-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-advent-pro font-bold text-charcoal flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={24} />
                  Calendrier
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-gold/20 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={goToCurrentMonth}
                    className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center relative shadow-sm"
                    title="Revenir au mois actuel"
                  >
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-800 rounded-full"></div>
                    </div>
                  </button>
                  <span className="text-lg font-medium capitalize">{getMonthName()}</span>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-gold/20 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </CardTitle>
              {selectedDates.length > 0 && (
                <div className="flex items-center justify-between bg-gold/10 p-3 rounded-lg">
                  <span className="text-sm text-charcoal">
                    {selectedDates.length} jour{selectedDates.length > 1 ? "s" : ""} sélectionné
                    {selectedDates.length > 1 ? "s" : ""}
                  </span>
                  <Button
                    onClick={clearSelection}
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-2 bg-transparent"
                  >
                    Effacer
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-sm mb-4">
                {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                  <div key={day} className="text-center font-medium text-charcoal/60 py-2">
                    {day}
                  </div>
                ))}
                {generateDates().map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-16"></div>
                  }

                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isMultiSelected = isDateSelected(date)
                  const isToday = date.toDateString() === new Date(2025, 6, 3).toDateString()
                  const isClosed = isClosedDay(date)

                  return (
                    <div
                      key={index}
                      className={`
                        h-16 rounded-lg border-2 transition-all relative
                        ${
                          isClosed
                            ? "bg-gray-light border-gray-300 cursor-not-allowed"
                            : isMultiSelected
                              ? "bg-gold/30 border-gold"
                              : isSelected
                                ? "bg-charcoal border-charcoal"
                                : isToday
                                  ? "bg-blue-100 border-blue-300 hover:bg-blue-200"
                                  : "bg-rose/20 border-rose/30 hover:bg-gold/20 hover:border-gold/40"
                        }
                      `}
                    >
                      {!isClosed && (
                        <label className="absolute top-1 left-1 w-5 h-5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMultiSelected}
                            onChange={() => toggleDateSelection(date)}
                            className="w-full h-full rounded accent-gold cursor-pointer"
                          />
                        </label>
                      )}
                      <button
                        onClick={() => !isClosed && handleDateClick(date)}
                        disabled={isClosed}
                        className={`
                          w-full h-full flex items-center justify-center text-sm font-medium transition-all
                          ${
                            isClosed
                              ? "text-charcoal/40 cursor-not-allowed"
                              : isSelected
                                ? "text-cream"
                                : isToday
                                  ? "text-blue-700 font-bold"
                                  : "text-charcoal hover:scale-105"
                          }
                        `}
                      >
                        {date.getDate()}
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gestion des créneaux */}
          {selectedDates.length > 0 ? (
            // Interface pour sélection multiple
            <Card className="bg-cream border-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-advent-pro font-bold text-charcoal flex items-center gap-2">
                  <CalendarDays size={24} />
                  Actions sur {selectedDates.length} jour{selectedDates.length > 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gold/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-charcoal mb-2">Dates sélectionnées :</h4>
                  <div className="text-sm text-charcoal/70 space-y-1">
                    {selectedDates.map((date, index) => (
                      <div key={index}>
                        {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boutons d'action pour sélection multiple */}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => applyToSelectedDates("morning")}
                    variant="outline"
                    className="border-red-400 text-red-600 hover:bg-red-50 flex items-center gap-2 bg-transparent"
                  >
                    <Sun size={16} />
                    Bloquer AMs
                  </Button>
                  <Button
                    onClick={() => applyToSelectedDates("afternoon")}
                    variant="outline"
                    className="border-red-400 text-red-600 hover:bg-red-50 flex items-center gap-2 bg-transparent"
                  >
                    <Moon size={16} />
                    Bloquer PMs
                  </Button>
                  <Button
                    onClick={() => applyToSelectedDates("fullday")}
                    variant="outline"
                    className="border-red-400 text-red-600 hover:bg-red-50 flex items-center gap-2 bg-transparent"
                  >
                    <X size={16} />
                    Bloquer journées
                  </Button>
                  <Button
                    onClick={setDefaultSchedule}
                    variant="outline"
                    className="border-green-400 text-green-600 hover:bg-green-50 flex items-center gap-2 bg-transparent"
                  >
                    <CalendarDays size={16} />
                    Mise par défaut
                  </Button>
                </div>
                {/* Bouton de sauvegarde pour sélection multiple - seulement si une action a été sélectionnée */}
                {actionSelected && (
                  <Button
                    onClick={saveChanges}
                    className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-3 transition-all mt-4"
                  >
                    Confirmer les modifications
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : selectedDate ? (
            // Interface pour jour unique (existante)
            <Card className="bg-cream border-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-advent-pro font-bold text-charcoal flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={24} />
                    <span className="text-lg">Créneaux du {formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateDay("prev")}
                      className="p-2 hover:bg-gold/20 rounded-lg transition-colors"
                      title="Jour précédent"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={goToToday}
                      className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center relative shadow-sm"
                      title="Revenir au jour actuel"
                    >
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-800 rounded-full"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateDay("next")}
                      className="p-2 hover:bg-gold/20 rounded-lg transition-colors"
                      title="Jour suivant"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Boutons rapides */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={toggleMorning}
                    variant="outline"
                    size="sm"
                    className={`${
                      isMorningOpen()
                        ? "border-red-400 text-red-600 hover:bg-red-50"
                        : "border-green-400 text-green-600 hover:bg-green-50"
                    } flex items-center gap-1 bg-transparent text-xs px-2 py-1 h-8`}
                  >
                    <Sun size={12} />
                    {isMorningOpen() ? "Bloquer AM" : "Ouvrir AM"}
                  </Button>
                  <Button
                    onClick={toggleAfternoon}
                    variant="outline"
                    size="sm"
                    className={`${
                      isAfternoonOpen()
                        ? "border-red-400 text-red-600 hover:bg-red-50"
                        : "border-green-400 text-green-600 hover:bg-green-50"
                    } flex items-center gap-1 bg-transparent text-xs px-2 py-1 h-8`}
                  >
                    <Moon size={12} />
                    {isAfternoonOpen() ? "Bloquer PM" : "Ouvrir PM"}
                  </Button>
                  <Button
                    onClick={toggleFullDay}
                    variant="outline"
                    size="sm"
                    className={`${
                      isFullDayOpen()
                        ? "border-red-400 text-red-600 hover:bg-red-50"
                        : "border-green-400 text-green-600 hover:bg-green-50"
                    } flex items-center gap-1 bg-transparent text-xs px-2 py-1 h-8`}
                  >
                    {isFullDayOpen() ? <X size={12} /> : <CalendarDays size={12} />}
                    {isFullDayOpen() ? "Bloquer jour" : "Ouvrir jour"}
                  </Button>
                </div>

                {/* Liste des créneaux */}
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => toggleTimeSlot(index)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                        slot.available
                          ? "bg-green-100 border-green-300 hover:bg-green-200"
                          : "bg-red-100 border-red-300 hover:bg-red-200"
                      }`}
                    >
                      <span className="font-medium text-charcoal text-lg">{slot.time}</span>
                      <div
                        className={`
                          w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                          ${
                            slot.available
                              ? "bg-green-500 border-green-600 text-white"
                              : "bg-red-500 border-red-600 text-white"
                          }
                        `}
                      >
                        {slot.available ? <Check size={16} /> : <X size={16} />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bouton de sauvegarde */}
                <Button
                  onClick={saveChanges}
                  className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-3 transition-all"
                >
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Message d'instruction
            <Card className="bg-cream border-gold/20 shadow-lg">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-charcoal/60">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Sélectionnez une date ou cochez plusieurs jours</p>
                  <p className="text-sm mt-2">pour gérer les créneaux horaires</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message de confirmation */}
        {showConfirmation && (
          <div className="fixed bottom-6 right-6 bg-gold text-charcoal px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <Check size={20} />
              <span className="font-medium">Modifications enregistrées avec succès !</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
