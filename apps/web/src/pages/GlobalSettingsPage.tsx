import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Key,
  Check,
  Save,
  Lock,
  Edit2,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useUser } from "../context/UserContext";

export default function GlobalSettingsPage() {
  const { user, isLoadingUser, userError } = useUser();
  const [name, setName] = useState("Yash Jejurkar");
  const [email, setEmail] = useState("yash@setu.dev");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("Workspace Owner");

  // Edit mode & loading states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setAvatarUrl(user.avatarUrl);
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate async network request for saving profile
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditingProfile(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 1200);
  };

  // Helper to extract the first character for the fallback avatar
  const getInitials = (str: string) => {
    return str ? str.charAt(0).toUpperCase() : "U";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "12px 16px 80px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          paddingBottom: "24px",
          borderBottom: "1px solid #222222",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Global Settings
          </h1>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Manage your personal profile credentials, avatar, and workspace
            access level.
          </p>
          {isLoadingUser && (
            <p style={{ fontSize: "12px", color: "#a1a1aa", margin: 0 }}>
              Loading profile...
            </p>
          )}
          {userError && (
            <p style={{ fontSize: "12px", color: "#f87171", margin: 0 }}>
              {userError}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AnimatePresence>
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  color: "#34D399",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                }}
              >
                <Check size={14} />
                <span>SAVED</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isEditingProfile && (
            <motion.button
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "#141414",
                border: "1px solid #262626",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "13px",
                padding: "10px 20px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} color="#34D399" className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={15} color="#C084FC" />
                  <span>Save Profile</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "28px" }}
      >
        {/* ── Section 1: User Profile & Avatar Credentials ─────────────── */}
        <div
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#34D399",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <h2
                style={{
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                USER PROFILE & AVATAR
              </h2>
            </div>

            {/* <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (isEditingProfile) {
                  setName("Yash Jejurkar");
                  setEmail("yash@setu.dev");
                  setAvatarUrl("");
                }
                setIsEditingProfile(!isEditingProfile);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: isEditingProfile ? "#222222" : "#171717",
                border: "1px solid #222222",
                color: isEditingProfile ? "#34D399" : "#ffffff",
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                textTransform: "uppercase",
              }}
            >
              {isEditingProfile ? (
                <>
                  <X size={13} color="#f87171" />
                  <span>CANCEL</span>
                </>
              ) : (
                <>
                  <Edit2 size={13} color="#C084FC" />
                  <span>EDIT PROFILE</span>
                </>
              )}
            </button> */}
          </div>

          {/* Avatar Preview Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#1c1c1c",
                border: "1px solid #2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: "0",
              }}
            >
              {avatarUrl.trim() !== "" ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setAvatarUrl("")}
                />
              ) : (
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#C084FC",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {getInitials(name)}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span
                style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}
              >
                Profile Avatar
              </span>
              <span style={{ fontSize: "11px", color: "#8e8e8e" }}>
                {isEditingProfile
                  ? "Provide an image URL or leave blank to keep the initial fallback badge."
                  : "Displays your profile picture or automatically renders an initial letter fallback badge."}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Full Name */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <User size={13} color="#8e8e8e" /> FULL NAME
              </label>
              <input
                type="text"
                required
                readOnly={!isEditingProfile}
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: isEditingProfile ? "#171717" : "#0f0f0f",
                  border: isEditingProfile
                    ? "1px solid #34D399"
                    : "1px solid #1f1f1f",
                  color: isEditingProfile ? "#ffffff" : "#8e8e8e",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  cursor: isEditingProfile ? "text" : "not-allowed",
                  boxSizing: "border-box",
                  transition: "all 0.15s ease",
                }}
              />
            </div>

            {/* Email Address */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Mail size={13} color="#8e8e8e" /> EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                readOnly={!isEditingProfile}
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@setu.dev"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: isEditingProfile ? "#171717" : "#0f0f0f",
                  border: isEditingProfile
                    ? "1px solid #34D399"
                    : "1px solid #1f1f1f",
                  color: isEditingProfile ? "#ffffff" : "#8e8e8e",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  cursor: isEditingProfile ? "text" : "not-allowed",
                  boxSizing: "border-box",
                  transition: "all 0.15s ease",
                }}
              />
            </div>

            {/* Avatar URL (Only editable when unlocked) */}
            <AnimatePresence>
              {isEditingProfile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    gridColumn: "1 / -1",
                    overflow: "hidden",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#71717a",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <ImageIcon size={13} color="#8e8e8e" /> AVATAR URL
                  </label>
                  <input
                    type="url"
                    disabled={isSubmitting}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 16px",
                      backgroundColor: "#171717",
                      border: "1px solid #34D399",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Section 2: Account Security & Role ────────────────────────── */}
        <div
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#34D399",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <h2
                style={{
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                ACCESS & PRIVILEGES
              </h2>
            </div>
            <Shield size={16} color="#71717a" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Account Role */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Key size={13} color="#8e8e8e" /> ACCESS ROLE
              </label>
              <input
                type="text"
                disabled
                value={role}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  color: "#8e8e8e",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  cursor: "not-allowed",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Gateway Key Status */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                SECURITY ENCRYPTION
              </label>
              <div
                style={{
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#8e8e8e",
                  boxSizing: "border-box",
                }}
              >
                <span>AES-256-GCM Vault</span>
                <span
                  style={{
                    color: "#34D399",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
