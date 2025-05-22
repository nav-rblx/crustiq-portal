// StickyNoteAnnouncement.tsx
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AvatarImageProps {
  userId: string
  className?: string
}

const AvatarImage: React.FC<AvatarImageProps> = ({ userId, className = "" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [initialRenderDone, setInitialRenderDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [avatarRes, userRes] = await Promise.all([
          fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`),
          fetch(`https://users.roproxy.com/v1/users/${userId}`),
        ]);

        const avatarData = await avatarRes.json();
        const userData = await userRes.json();

        if (isMounted) {
          if (avatarData?.data?.[0]?.imageUrl) {
            setImageUrl(avatarData.data[0].imageUrl);
          }
          if (userData?.name) {
            setUsername(userData.name);
          }
        }
      } catch (error) {
        console.error("Failed fetching data for user", userId, error);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Delay activating animation until initial load is complete
  useEffect(() => {
    if (loaded) {
      const timeout = setTimeout(() => {
        setInitialRenderDone(true);
      }, 50); // slight delay to avoid triggering hover animation on first load

      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  return (
    <motion.div
      className={`relative group w-12 h-12 rounded-full p-[2px] bg-white dark:bg-gray-700 outline outline-2 outline-blue-500 dark:outline-blue-400 shadow-md flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={
        initialRenderDone
          ? {
              scale: isHovered ? 1.2 : 1,
              zIndex: isHovered ? 20 : 1,
            }
          : {}
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transition: "opacity 0.6s ease-in-out", opacity: loaded ? 1 : 0 }}
    >
      <img
        src={imageUrl || "/fallback.png"}
        alt="Roblox Avatar"
        onLoad={() => setLoaded(true)}
        className="w-full h-full rounded-full object-cover"
      />
      <motion.span
        className="absolute bottom-[-24px] left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {username || "Loading..."}
      </motion.span>
    </motion.div>
  );
};

interface ToggleItemProps {
  title: string
  description: string
}

const ToggleItem: React.FC<ToggleItemProps> = ({ title, description }) => {
  const [open, setOpen] = useState(false)

  return (
    <li className="cursor-pointer select-none">
      <div
        className="flex items-start gap-2 hover:text-blue-600 transition"
        onClick={() => setOpen(!open)}
      >
        <strong>{open ? "⤥" : ">"}</strong>
        {title}
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            className="pl-6 pt-1 text-sm text-gray-700 dark:text-gray-400"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function StickyNoteAnnouncement() {
  return (
    <div className="z-0 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-sm px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 mb-6 relative">

      {/* Top: Avatars and Title */}
      <div className="flex items-center space-x-3">
        <div className="flex -space-x-5 relative">
          <AvatarImage userId="3542958671" />
          <AvatarImage userId="1115323210" />
        </div>
        <div className="text-lg text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1">
          <span role="img" aria-label="pin">📍</span>
          Crustiq Ownership
        </div>
      </div>

      {/* Banner Image */}
      <img
        src="/banner-1.png"
        alt="Crustiq Banner"
        className="w-full h-32 object-cover rounded-lg"
      />

      {/* Main Content */}
      <div className="text-gray-900 dark:text-gray-100 text-sm space-y-3">
        <p>👋 <strong>Welcome to Crustiq's Staff Management Portal!</strong></p>
        <p>
          We're excited to have you on board. As a member of our management team, you are given access to this website to utilize a variety of useful tools to help us manage things in relation to staff management. This portal will be used for the following:
        </p>

        <ul className="pl-4 space-y-2 text-gray-800 dark:text-gray-300" style={{ listStyleType: 'none' }}>
          <ToggleItem title="Session Planning" description="Create, schedule, and oversee staff sessions efficiently." />
          <ToggleItem title="Activity Tracking" description="Track staff contributions, shifts, and responsibilities." />
          <ToggleItem title="Inactivity Notice" description="Submit and manage inactivity requests professionally." />
          <ToggleItem title="Vital Information" description="Access key resources, announcements, and policies." />
        </ul>

        <p>
          🚧 <strong>Note:</strong> This is currently in <em>Beta</em>, thus you may encounter bugs or unexpected behavior. But if one happens, let us know by contacting support. Thank you and have a great time!
        </p>
      </div>
    </div>
  )
}
