import { formatPhoneNumber, getPhoneLink, getSmsLink } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Phone, MessageSquare } from 'lucide-react'

interface ContactWidgetProps {
  phone?: string
  customerName: string
}

export default function ContactWidget({ phone, customerName }: ContactWidgetProps) {
  const phoneLink = getPhoneLink(phone)
  const smsLink = getSmsLink(phone)
  const formattedPhone = formatPhoneNumber(phone)

  if (!phone || !phoneLink) {
    return (
      <div className="text-ios-subheadline text-ios-label-tertiary italic">
        No phone number available
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        size="default"
        className="text-ios-subheadline font-medium min-h-[44px] active:scale-[0.98] transition-transform"
        asChild
      >
        <a href={phoneLink} aria-label={`Call ${customerName}`}>
          <Phone className="w-4 h-4" />
          Call
        </a>
      </Button>

      {smsLink && (
        <Button
          variant="outline"
          size="default"
          className="text-ios-subheadline font-medium min-h-[44px] active:scale-[0.98] transition-transform"
          asChild
        >
          <a href={smsLink} aria-label={`Text ${customerName}`}>
            <MessageSquare className="w-4 h-4" />
            Text
          </a>
        </Button>
      )}

      <div className="flex items-center text-ios-subheadline text-gray-600 font-medium">
        {formattedPhone}
      </div>
    </div>
  )
}
