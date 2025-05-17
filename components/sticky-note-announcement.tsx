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
      className={`w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 ${className}`}
    />
  )
}

export default function StickyNoteAnnouncement() {
  return (
    <div className="z-0 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col space-y-6 mb-6 relative max-w-3xl mx-auto">
      {/* Header: Avatars + Title */}
      <div className="flex items-center space-x-4">
        <div className="flex -space-x-3">
          <AvatarImage userId="0000" className="z-10" />
          <AvatarImage userId="1111" className="z-0" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="pin">📍</span>
          Crustiq Ownership
        </h3>
      </div>

      {/* Banner */}
      <img
        src="/banner-placeholder.png"
        alt="Banner"
        className="w-full h-32 object-cover rounded-lg shadow-md"
      />

      {/* Content */}
      <div className="text-gray-900 dark:text-gray-100 text-base space-y-4">
        <p>
          👋 <strong>Welcome to Crustiq's Staff Management Portal!</strong>
        </p>
        <p>
          We're excited to have you on board. As a member of our management team, you are given access to this website to utilize a variety of useful tools to help us manage things in relation to staff management. This portal will be used for the following:
        </p>
        <ul className="pl-4 space-y-1 text-gray-800 dark:text-gray-300" style={{ listStyleType: 'none' }}>
          {[
            "Session Planning",
            "Activity Tracking",
            "Inactivity Notice",
            "Vital Information",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="font-bold select-none">{">"}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          🚧 <strong>Note:</strong> This is currently in <em>Beta</em>, thus you may encounter bugs or unexpected behavior. But if one happens, let us know by contacting support. Thank you and have a great time!
        </p>
      </div>
    </div>
  )
}
