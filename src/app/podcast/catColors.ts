export const CAT_COLORS: Record<string, { fg: string; bg: string; ring: string; solid: string; label: string }> = {
  nutrition:  { fg: 'text-[#0F8A4F]', bg: 'bg-[#E6F8EE]', ring: 'ring-[#BFEAD2]', solid: 'bg-[#12C76F]', label: 'Nutrition' },
  sport:      { fg: 'text-[#A85800]', bg: 'bg-[#FFEFD9]', ring: 'ring-[#FFD9A3]', solid: 'bg-[#FF8A00]', label: 'Sport' },
  maternite:  { fg: 'text-[#B0285E]', bg: 'bg-[#FFE0EC]', ring: 'ring-[#FFC2D8]', solid: 'bg-[#FF4D8D]', label: 'Maternité' },
  mental:     { fg: 'text-[#3046C7]', bg: 'bg-[#E4E8FF]', ring: 'ring-[#C7D0FF]', solid: 'bg-[#5B6BFF]', label: 'Santé mentale' },
  prevention: { fg: 'text-[#1240C7]', bg: 'bg-[#E2ECFF]', ring: 'ring-[#B8CDFF]', solid: 'bg-[#1E5BFF]', label: 'Prévention' },
  tradition:  { fg: 'text-[#8A6A00]', bg: 'bg-[#FFF6CC]', ring: 'ring-[#FFE88A]', solid: 'bg-[#FFD400]', label: 'Tradition' },
};

export const cat = (id: string) => CAT_COLORS[id] ?? CAT_COLORS.prevention;
