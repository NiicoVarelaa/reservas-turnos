import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CTA } from '@/constants/copy'

export default function MobileStickyBookingBar({ targetSelector = '[data-hero-cta]' }) {
  const [visible, setVisible] = useState(false)
  const barRef = useRef(null)

  useEffect(() => {
    const heroCta = document.querySelector(targetSelector)
    if (!heroCta || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(heroCta)

    return () => observer.disconnect()
  }, [targetSelector])

  useEffect(() => {
    if (!visible) return
    const paddingEl = document.body
    const prev = paddingEl.style.paddingBottom
    paddingEl.style.paddingBottom = 'calc(72px + env(safe-area-inset-bottom))'

    return () => {
      paddingEl.style.paddingBottom = prev
    }
  }, [visible])

  return (
    <div
      ref={barRef}
      className={[
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        'border-t border-border bg-background/95 backdrop-blur',
        'px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
        'transition-transform duration-200',
        visible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      <Link to="/book" className="block w-full">
        <Button size="lg" className="w-full bg-primary text-primary-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          {CTA.primary}
        </Button>
      </Link>
    </div>
  )
}
