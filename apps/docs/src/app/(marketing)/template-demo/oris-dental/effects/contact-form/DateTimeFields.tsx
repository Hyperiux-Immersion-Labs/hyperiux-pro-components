'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// Date & time slot pickers for the booking form, styled like its treatment dropdown.

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
/** How far ahead a visit can be booked, in days. */
const BOOKING_WINDOW_DAYS = 60
const TIME_SLOTS = [
    { label: 'Morning', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
    {
        label: 'Afternoon',
        slots: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
    },
    { label: 'Evening', slots: ['17:00', '17:30', '18:00', '18:30'] },
]

const pad = (n: number) => String(n).padStart(2, '0')
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISODate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}
const startOfToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

export const formatDate = (iso: string) =>
    iso ? fromISODate(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''

export const formatTime = (hhmm: string) => {
    if (!hhmm) return ''
    const [h, m] = hhmm.split(':').map(Number)
    return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}

/** Today's slots that have already started can't be booked. */
export const isPastSlot = (iso: string, hhmm: string) => {
    if (!iso || !hhmm || iso !== toISODate(new Date())) return false
    const [h, m] = hhmm.split(':').map(Number)
    const now = new Date()
    return h * 60 + m <= now.getHours() * 60 + now.getMinutes()
}

function useCloseOnOutside(ref: React.RefObject<HTMLDivElement | null>, open: boolean, onClose: () => void) {
    useEffect(() => {
        if (!open) return
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose()
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('mousedown', handle)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', handle)
            document.removeEventListener('keydown', onKey)
        }
    }, [ref, open, onClose])
}

type PickerFieldProps = {
    id: string
    label: string
    display: string
    open: boolean
    error?: string
    onToggle: () => void
    icon: React.ReactNode
    fieldRef: React.RefObject<HTMLDivElement | null>
    children: React.ReactNode
}

// Shared shell: floating label + bordered button + right icon, matching the treatment field.
function PickerField({ id, label, display, open, error, onToggle, icon, fieldRef, children }: PickerFieldProps) {
    const floated = open || !!display
    return (
        <div className="w-full min-w-0" ref={fieldRef}>
            <div className="relative w-full">
                <span
                    className={`absolute left-3 transition-all duration-200 px-1 bg-white z-10 pointer-events-none whitespace-nowrap ${
                        floated
                            ? `top-0 -translate-y-1/2 text-xs font-medium ${open ? 'text-[#3365e2]' : 'text-gray-700'}`
                            : 'top-1/2 -translate-y-1/2 text-sm max-lg:text-[2vw] max-md:text-[4vw] text-gray-700'
                    }`}
                >
                    {label}
                </span>
                <button
                    id={id}
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    onClick={onToggle}
                    className={`w-full border rounded-md bg-white h-13 pl-4 pr-10 text-left text-sm max-lg:text-[2vw] max-md:text-[4vw] outline-none transition-all cursor-pointer flex items-center ${
                        error ? 'border-red-400' : open ? 'border-[#3365e2]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <span className={`truncate ${display ? 'text-gray-800 font-normal' : 'opacity-0'}`}>
                        {display || label}
                    </span>
                </button>
                <span
                    className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                        open ? 'text-[#3365e2]' : 'text-gray-700'
                    }`}
                >
                    {icon}
                </span>
                {open && children}
            </div>
            {error && <p className="mt-1 ml-3 text-xs text-red-500">{error}</p>}
        </div>
    )
}

const CalendarIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path strokeLinecap="round" d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
)

const ClockIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
    </svg>
)

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
)

type DateFieldProps = { id: string; value: string; onChange: (iso: string) => void; error?: string }

export function DateField({ id, value, onChange, error }: DateFieldProps) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [open, setOpen] = useState(false)
    const close = useCallback(() => setOpen(false), [])
    useCloseOnOutside(ref, open, close)

    const today = startOfToday()
    const lastDay = new Date(today)
    lastDay.setDate(lastDay.getDate() + BOOKING_WINDOW_DAYS)
    // First day of the month being shown; null follows the chosen date (or today).
    const [view, setView] = useState<Date | null>(null)
    const month = view || (value ? fromISODate(value) : today)
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const leading = (first.getDay() + 6) % 7 // Monday-first grid
    const canPrev = first > new Date(today.getFullYear(), today.getMonth(), 1)
    const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay
    const shift = (n: number) => setView(new Date(first.getFullYear(), first.getMonth() + n, 1))

    return (
        <PickerField
            id={id}
            fieldRef={ref}
            label="Preferred date*"
            display={formatDate(value)}
            open={open}
            error={error}
            icon={CalendarIcon}
            onToggle={() => {
                setView(null)
                setOpen(!open)
            }}
        >
            <div
                role="dialog"
                aria-label="Choose a date"
                className="absolute top-full left-0 mt-1 w-72 max-w-[calc(100vw-4rem)] bg-white border border-gray-200 rounded-md shadow-xl z-50 p-3"
            >
                <div className="flex items-center justify-between mb-2">
                    <button
                        type="button"
                        disabled={!canPrev}
                        onClick={() => shift(-1)}
                        aria-label="Previous month"
                        className="flex items-center justify-center size-7 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Chevron dir="left" />
                    </button>
                    <p className="text-sm font-medium text-gray-800">
                        {first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </p>
                    <button
                        type="button"
                        disabled={!canNext}
                        onClick={() => shift(1)}
                        aria-label="Next month"
                        className="flex items-center justify-center size-7 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Chevron dir="right" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center">
                    {WEEKDAYS.map((d) => (
                        <span key={d} className="text-[11px] font-medium text-gray-400 py-1">
                            {d}
                        </span>
                    ))}
                    {Array.from({ length: leading }, (_, i) => (
                        <span key={`pad-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = new Date(first.getFullYear(), first.getMonth(), i + 1)
                        const iso = toISODate(day)
                        // Closed on Sundays
                        const closed = day.getDay() === 0
                        const disabled = day < today || day > lastDay || closed
                        const selected = iso === value
                        const isToday = iso === toISODate(today)
                        return (
                            <button
                                key={iso}
                                type="button"
                                disabled={disabled}
                                aria-pressed={selected}
                                aria-label={day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                onClick={() => {
                                    onChange(iso)
                                    setOpen(false)
                                }}
                                className={`mx-auto flex items-center justify-center size-8 rounded-full text-xs transition-colors ${
                                    selected
                                        ? 'bg-[#3365e2] text-white font-medium'
                                        : disabled
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : `text-gray-700 hover:bg-blue-50 hover:text-[#3365e2] cursor-pointer ${isToday ? 'ring-1 ring-[#3365e2]/40' : ''}`
                                }`}
                            >
                                {i + 1}
                            </button>
                        )
                    })}
                </div>
                <p className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">Open Mon–Sat, 9 AM – 7 PM</p>
            </div>
        </PickerField>
    )
}

type TimeFieldProps = { id: string; value: string; date: string; onChange: (hhmm: string) => void; error?: string }

export function TimeField({ id, value, date, onChange, error }: TimeFieldProps) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [open, setOpen] = useState(false)
    const close = useCallback(() => setOpen(false), [])
    useCloseOnOutside(ref, open, close)

    return (
        <PickerField
            id={id}
            fieldRef={ref}
            label="Time slot*"
            display={formatTime(value)}
            open={open}
            error={error}
            icon={ClockIcon}
            onToggle={() => setOpen(!open)}
        >
            <div
                role="dialog"
                aria-label="Choose a time slot"
                className="absolute top-full right-0 mt-1 w-72 max-w-[calc(100vw-4rem)] bg-white border border-gray-200 rounded-md shadow-xl z-50 p-3 flex flex-col gap-3"
            >
                {TIME_SLOTS.map((group) => (
                    <div key={group.label}>
                        <p className="text-[11px] font-medium text-gray-400 mb-1.5">{group.label}</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {group.slots.map((slot) => {
                                const disabled = isPastSlot(date, slot)
                                const selected = slot === value
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        disabled={disabled}
                                        aria-pressed={selected}
                                        onClick={() => {
                                            onChange(slot)
                                            setOpen(false)
                                        }}
                                        className={`rounded-md border py-1.5 text-xs transition-colors ${
                                            selected
                                                ? 'bg-[#3365e2] border-[#3365e2] text-white font-medium'
                                                : disabled
                                                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                                  : 'border-gray-200 text-gray-700 hover:border-[#3365e2] hover:text-[#3365e2] cursor-pointer'
                                        }`}
                                    >
                                        {formatTime(slot)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </PickerField>
    )
}
