// AdminProfile.tsx
import { useState, useRef, useEffect } from "react";

const randomColor = () => {
  const colors = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    firstName: "Tsehay",
    lastName: "Admin",
    jobTitle: "",
    company: "",
    email: "",
    phone: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBg, setAvatarBg] = useState(randomColor());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data
  useEffect(() => {
    const savedProfile = localStorage.getItem("admin_profile");
    const savedAvatar = localStorage.getItem("admin_avatar");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedAvatar) setAvatarPreview(savedAvatar);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await convertToBase64(file);

    setAvatarPreview(base64);
    setAvatarBg(randomColor());
  };

  const handleSave = () => {
    localStorage.setItem("admin_profile", JSON.stringify(profile));

    if (avatarPreview) {
      localStorage.setItem("admin_avatar", avatarPreview);
    }

    alert("Profile saved!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-10">
          
          {/* Avatar */}
          <div
            onClick={handleAvatarClick}
            className="flex justify-center items-center h-24 w-24 rounded-xl overflow-hidden cursor-pointer"
            style={{ backgroundColor: avatarBg }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Name */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-semibold text-gray-800">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-gray-500">{profile.jobTitle || ""}</p>
            <p className="text-gray-400 text-sm">{profile.company || ""}</p>
          </div>
        </div>

        {/* FORM */}
        <form className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mb-8">
          {[
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Job Title", name: "jobTitle", type: "text" },
            { label: "Company", name: "company", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone", type: "tel" },
          ].map((field) => (
            <div key={field.name}>
              <input
                type={field.type}
                name={field.name}
                value={profile[field.name as keyof typeof profile] || ""}
                onChange={handleChange}
                className="
                  block w-full h-12 px-4 text-sm text-gray-900 bg-white rounded-lg 
                  border border-gray-300 
                  focus:outline-none focus:ring-2 focus:ring-green-600
                  hover:border-gray-400
                  transition-all
                "
              />
            </div>
          ))}
        </form>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;
