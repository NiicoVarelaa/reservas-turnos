import { cn, getInitials, getAvatarColor } from '@/lib/utils'

export default function InitialsAvatar({ name = '', className }) {
  const { bg, text } = getAvatarColor(name)
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        bg,
        text,
        'w-10 h-10 text-sm',
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
