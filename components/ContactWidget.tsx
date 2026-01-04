import { formatPhoneNumber, getPhoneLink, getSmsLink } from '@/lib/utils'

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
    <div className="flex flex-wrap gap-2">
      <a
        href={phoneLink}
        className="btn-secondary text-ios-subheadline py-2.5 px-4 min-h-0"
        aria-label={`Call ${customerName}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        Call
      </a>

      {smsLink && (
        <a
          href={smsLink}
          className="btn-secondary text-ios-subheadline py-2.5 px-4 min-h-0"
          aria-label={`Text ${customerName}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          Text
        </a>
      )}

      <div className="flex items-center text-ios-subheadline text-ios-label-secondary font-medium">
        {formattedPhone}
      </div>
    </div>
  )
}
