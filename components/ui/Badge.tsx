type BadgeVariant = 'pending' | 'matched' | 'declined' | 'blue' | 'green' | 'red' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const variantClass: Record<BadgeVariant, string> = {
  pending: 'badge-pending',
  matched: 'badge-matched',
  declined: 'badge-declined',
  blue: 'pstatus-pending',
  green: 'pstatus-confirmed',
  red: 'badge-declined',
  purple: 'dp-type-ent',
}

export function Badge({ children, variant = 'pending' }: BadgeProps) {
  return (
    <span className={`status-badge ${variantClass[variant]}`}>
      {children}
    </span>
  )
}
