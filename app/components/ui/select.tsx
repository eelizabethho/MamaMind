"use client"

import * as React from "react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  isOpen: false,
  setIsOpen: () => {},
})

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [isOpen])

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { value, isOpen, setIsOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
      }}
      className={`flex items-center justify-between w-full px-4 py-2 bg-white/50 border border-white rounded-lg text-sm font-medium text-[#2d1b2d] hover:bg-white/70 transition-all ${className}`}
      {...props}
    >
      {children || <SelectValue />}
      <svg
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  )
}

export function SelectValue({
  placeholder,
}: {
  placeholder?: string
}) {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

export function SelectContent({
  className = "",
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { isOpen } = React.useContext(SelectContext)

  if (!isOpen) return null

  return (
    <div
      className={`absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-white/50 py-1 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  value,
  className = "",
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.(value)
    setIsOpen(false)
  }

  return (
    <div
      className={`px-4 py-2 text-sm text-[#2d1b2d] hover:bg-[#F6B0BB]/20 cursor-pointer rounded-lg ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
