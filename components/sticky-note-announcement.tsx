import { useEffect, useState } from "react"

interface AvatarImageProps {
  userId: string
  className?: string
}

const AvatarImage: React.FC<AvatarImageProps> = ({ userId, className = "" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch(
          `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
        )
        const data = await response.json()
        if (data?.data?.[0]?.imageUrl) {
          setImageUrl(data.data[0].imageUrl)
        }
      } catch (err) {
        console.error("Failed to fetch avatar image:", err)
      }
    }

    fetchAvatar()
  }, [userId])

  return (
    <img
      src={imageUrl || "/fallback.png"}
      alt="Roblox Avatar"
      className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 ${className}`}
    />
  )
}

export default function StickyNoteAnnouncement() {
  return (
    <div className="z-0 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-start space-x-4 mb-6 relative">
      {/* Left: Avatars and Pin */}
      <div className="flex flex-col items-center pt-1">
        <div className="flex -space-x-3">
          <AvatarImage userId="3542958671" className="z-10" />
          <AvatarImage userId="1115323210" className="z-0" />
        </div>
        <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 font-medium flex items-center gap-1">
          <span role="img" aria-label="pin">📍</span>
          Crustiq Ownership
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1">
        {/* Banner Image */}
<img
  src="/banner.png"
  alt="Crustiq Banner"
  className="w-full h-32 object-cover rounded-lg mb-3"
/>

        {/* Main Text */}
        <div className="text-gray-900 dark:text-gray-100 text-sm space-y-3">
          <p>👋 <strong>Welcome to Crustiq's Staff Management Portal!</strong></p>

          <p>
            We're excited to have you on board. As a member of our management team, you are given access to this website to utilize a variety of useful tools to help us manage things in relation to staff management. This portal will be used for the following:
          </p>

          <ul className="pl-4 space-y-1 text-gray-800 dark:text-gray-300" style={{ listStyleType: 'none' }}>
            <li className="flex items-start gap-2"><strong>{">"}</strong> Session Planning</li>
            <li className="flex items-start gap-2"><strong>{">"}</strong> Activity Tracking</li>
            <li className="flex items-start gap-2"><strong>{">"}</strong> Inactivity Notice</li>
            <li className="flex items-start gap-2"><strong>{">"}</strong> Vital Information</li>
          </ul>

          <p>
            🚧 <strong>Note:</strong> This is currently in <em>Beta</em>, thus you may encounter bugs or unexpected behavior. But if one happens, let us know by contacting support. Thank you and have a great time!
          </p>
        </div>
      </div>
    </div>
  )
}
