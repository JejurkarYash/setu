import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Send, Trash2, CheckCircle2, Lock } from "lucide-react";
import {
  useProjects,
  type NotificationChannel,
} from "../../context/ProjectContext";
import {
  createAlertConfig,
  fetchAlertConfig,
  updateAlertConfig,
  type AlertConfig,
} from "../../api/alertApi";

// Official Color Slack SVG Icon
function SlackBrandIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 127 127" fill="none">
      <path
        d="M27.3 80c0 7.3-6 13.3-13.3 13.3C6.7 93.3.7 87.3.7 80c0-7.3 6-13.3 13.3-13.3h13.3V80z"
        fill="#E01E5A"
      />
      <path
        d="M34 80c0-7.3 6-13.3 13.3-13.3 7.3 0 13.3 6 13.3 13.3v33.3c0 7.3-6 13.3-13.3 13.3-7.3 0-13.3-6-13.3-13.3V80z"
        fill="#E01E5A"
      />
      <path
        d="M47.3 27.3c-7.3 0-13.3-6-13.3-13.3C34 6.7 40 .7 47.3.7c7.3 0 13.3 6 13.3 13.3v13.3H47.3z"
        fill="#36C5F0"
      />
      <path
        d="M47.3 34c7.3 0 13.3 6 13.3 13.3 0 7.3-6 13.3-13.3 13.3H14C6.7 60.7.7 54.7.7 47.3c0-7.3 6-13.3 13.3-13.3h33.3z"
        fill="#36C5F0"
      />
      <path
        d="M99.7 47.3c0-7.3 6-13.3 13.3-13.3 7.3 0 13.3 6 13.3 13.3 0 7.3-6 13.3-13.3 13.3H99.7V47.3z"
        fill="#2EB67D"
      />
      <path
        d="M93 47.3c0 7.3-6 13.3-13.3 13.3-7.3 0-13.3-6-13.3-13.3V14C66.4 6.7 72.4.7 79.7.7c7.3 0 13.3 6 13.3 13.3v33.3z"
        fill="#2EB67D"
      />
      <path
        d="M79.7 99.7c7.3 0 13.3 6 13.3 13.3 0 7.3-6 13.3-13.3 13.3-7.3 0-13.3-6-13.3-13.3V99.7h13.3z"
        fill="#ECB22E"
      />
      <path
        d="M79.7 93c-7.3 0-13.3-6-13.3-13.3 0-7.3 6-13.3 13.3-13.3h33.3c7.3 0 13.3 6 13.3 13.3 0 7.3-6 13.3-13.3 13.3H79.7z"
        fill="#ECB22E"
      />
    </svg>
  );
}

// Official Gmail/Email Brand SVG Icon
function EmailBrandIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M1.5 18.5V5.5C1.5 4.4 2.4 3.5 3.5 3.5H20.5C21.6 3.5 22.5 4.4 22.5 5.5V18.5C22.5 19.6 21.6 20.5 20.5 20.5H3.5C2.4 20.5 1.5 19.6 1.5 18.5Z"
        fill="#1a1a1a"
        stroke="#EA4335"
        strokeWidth="1.5"
      />
      <path
        d="M22.5 5.5L12 13L1.5 5.5"
        stroke="#EA4335"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectAlertsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, isLoadingProjects, projectsError } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isLoadingAlert, setIsLoadingAlert] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [thresholdPct, setThresholdPct] = useState(80);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);

  useEffect(() => {
    if (!projectId) {
      setIsLoadingAlert(false);
      return;
    }

    let isMounted = true;
    setIsLoadingAlert(true);
    setErrorMsg(null);

    fetchAlertConfig(projectId)
      .then((config) => {
        if (!isMounted) return;
        setAlertConfig(config);
        setAlertsEnabled(config?.notify_slack ?? false);
        setThresholdPct(config?.trigger_threshold_pct ?? 80);
        setChannels(
          config?.notify_slack
            ? [
                {
                  id: "slack-configured",
                  type: "slack",
                  enabled: true,
                },
              ]
            : [],
        );
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Failed to load alert configuration",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoadingAlert(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const [selectedChannelType, setSelectedChannelType] = useState<
    "slack" | "email"
  >("slack");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [testSentId, setTestSentId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isLoadingProjects || isLoadingAlert) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "64px 16px",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          color: "#8e8e8e",
        }}
      >
        Loading alert configuration...
      </div>
    );
  }

  if (!project) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "64px 16px",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          color: "#ffffff",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
          {projectsError ? "Unable to load project" : "Project not found"}
        </h2>
        <Link
          to="/dashboard"
          style={{
            marginTop: "24px",
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontWeight: 700,
            fontSize: "12px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleAddChannel = () => {
    setErrorMsg(null);
    if (selectedChannelType === "email") return;

    if (!newWebhookUrl.trim()) {
      setErrorMsg("Please enter a valid Slack Webhook URL.");
      return;
    }

    const newChannel: NotificationChannel = {
      id: `slack-${Date.now()}`,
      type: "slack",
      webhookUrl: newWebhookUrl.trim(),
      enabled: true,
    };

    setChannels((prev) => [...prev, newChannel]);
    setNewWebhookUrl("");
  };

  const handleRemoveChannel = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const webhook = channels.find(
        (channel) => channel.type === "slack" && channel.webhookUrl,
      )?.webhookUrl;
      const payload = {
        trigger_threshold: thresholdPct,
        notify_slack: alertsEnabled,
        ...(webhook ? { slack_webhook_url: webhook } : {}),
      };
      const saved = alertConfig
        ? await updateAlertConfig(projectId, payload)
        : await createAlertConfig(projectId, payload);

      setAlertConfig(saved);
      setNewWebhookUrl("");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Failed to save alert configuration",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestAlert = (channelId: string) => {
    setTestSentId(channelId);
    setTimeout(() => setTestSentId(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
      {/* ── Header ─────────────────────────────────────────────────── */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#8e8e8e",
            }}
          >
            <Link
              to="/dashboard"
              style={{ color: "#8e8e8e", textDecoration: "none" }}
            >
              Projects
            </Link>
            <span>/</span>
            <Link
              to={`/dashboard/project/${project.id}`}
              style={{ color: "#8e8e8e", textDecoration: "none" }}
            >
              {project.name}
            </Link>
            <span>/</span>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              Budget Alerts
            </span>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Budget Alerts & Notifications
          </h1>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Configure real-time notifications to trigger when budget consumption
            reaches configured thresholds.
          </p>
        </div>

        <AnimatePresence>
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                color: "#34D399",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              <Check size={14} />
              <span>ALERTS SAVED</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "28px" }}
      >
        {/* ── Master Alert Toggle Card ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={18} color={alertsEnabled ? "#34D399" : "#71717a"} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "13px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                ENABLE BUDGET ALERTS
              </h2>
              <p style={{ fontSize: "12px", color: "#8e8e8e", margin: 0 }}>
                {alertsEnabled
                  ? "Alerts are currently ACTIVE and monitoring budget thresholds."
                  : "Alerts are DISABLED by default."}
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            style={{
              padding: "8px 16px",
              backgroundColor: alertsEnabled
                ? "rgba(52, 211, 153, 0.1)"
                : "#171717",
              border: alertsEnabled
                ? "1px solid rgba(52, 211, 153, 0.3)"
                : "1px solid #222222",
              color: alertsEnabled ? "#34D399" : "#71717a",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all 0.15s ease",
            }}
          >
            {alertsEnabled ? "ENABLED" : "DISABLED"}
          </motion.button>
        </motion.div>

        {/* ── Threshold Slider Configuration (With Inactive Overlay & Dimming) ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          style={{
            position: "relative",
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Animated Inactive Dimming & Blur Effect */}
          <motion.div
            animate={{
              opacity: alertsEnabled ? 1 : 0.35,
              filter: alertsEnabled
                ? "grayscale(0%) blur(0px)"
                : "grayscale(80%) blur(1px)",
            }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              pointerEvents: alertsEnabled ? "auto" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  TRIGGER THRESHOLD
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#8e8e8e",
                    margin: "4px 0 0 0",
                  }}
                >
                  Dispatches notifications once spend crosses this percentage of
                  monthly budget limit.
                </p>
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#34D399",
                }}
              >
                {thresholdPct}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={thresholdPct}
              onChange={(e) => setThresholdPct(parseInt(e.target.value))}
              disabled={!alertsEnabled}
              style={{
                width: "100%",
                accentColor: "#34D399",
                cursor: "pointer",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              {[50, 75, 80, 90, 95].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={!alertsEnabled}
                  onClick={() => setThresholdPct(preset)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    backgroundColor:
                      thresholdPct === preset ? "#222222" : "#171717",
                    color: thresholdPct === preset ? "#ffffff" : "#71717a",
                    border: "1px solid #222222",
                    cursor: "pointer",
                  }}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </motion.div>

          {/* Locked Overlay Badge when disabled */}
          {!alertsEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(18, 18, 18, 0.4)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  backgroundColor: "#171717",
                  border: "1px solid #262626",
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#71717a",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <Lock size={12} color="#71717a" />
                <span>SECTION INACTIVE</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Notification Channel Management (With Inactive Overlay & Dimming) ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          style={{
            position: "relative",
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Animated Inactive Dimming & Blur Effect */}
          <motion.div
            animate={{
              opacity: alertsEnabled ? 1 : 0.35,
              filter: alertsEnabled
                ? "grayscale(0%) blur(0px)"
                : "grayscale(80%) blur(1px)",
            }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              pointerEvents: alertsEnabled ? "auto" : "none",
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              NOTIFICATION CHANNELS
            </h3>

            {/* Add Channel Picker */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#71717a",
                  fontWeight: 700,
                }}
              >
                ADD NEW CHANNEL
              </span>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedChannelType("slack")}
                  disabled={!alertsEnabled}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor:
                      selectedChannelType === "slack"
                        ? "#222222"
                        : "transparent",
                    border: "1px solid #222222",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <SlackBrandIcon size={16} />
                  <span>SLACK WEBHOOK</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannelType("email")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "transparent",
                    border: "1px solid #222222",
                    color: "#71717a",
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    cursor: "not-allowed",
                  }}
                >
                  <EmailBrandIcon size={16} />
                  <span>EMAIL (COMING SOON)</span>
                </button>
              </div>

              {selectedChannelType === "slack" && (
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={newWebhookUrl}
                    disabled={!alertsEnabled}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    style={{
                      flex: 1,
                      height: "38px",
                      padding: "0 12px",
                      backgroundColor: "#121212",
                      border: "1px solid #222222",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    disabled={!alertsEnabled}
                    onClick={handleAddChannel}
                    style={{
                      padding: "0 16px",
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    ADD CHANNEL
                  </button>
                </div>
              )}

              {errorMsg && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#f87171",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {errorMsg}
                </span>
              )}
            </div>

            {/* Configured Channel List */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <AnimatePresence>
                {channels.map((channel) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, scale: 0.97, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: "16px",
                      backgroundColor: "#171717",
                      border: "1px solid #222222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <SlackBrandIcon size={18} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#ffffff",
                            fontWeight: 600,
                          }}
                        >
                          SLACK WEBHOOK
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#71717a",
                          }}
                        >
                          {channel.webhookUrl
                            ? `${channel.webhookUrl.slice(0, 35)}...`
                            : "CONFIGURED"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="button"
                        disabled={!alertsEnabled}
                        onClick={() => handleSendTestAlert(channel.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          backgroundColor: "#121212",
                          border: "1px solid #222222",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {testSentId === channel.id ? (
                          <CheckCircle2 size={14} color="#34D399" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span>
                          {testSentId === channel.id ? "DELIVERED" : "TEST"}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={!alertsEnabled}
                        onClick={() => handleRemoveChannel(channel.id)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#f87171",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Locked Overlay Badge when disabled */}
          {!alertsEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(18, 18, 18, 0.4)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  backgroundColor: "#171717",
                  border: "1px solid #262626",
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#71717a",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <Lock size={12} color="#71717a" />
                <span>SECTION INACTIVE</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Save Button ───────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <motion.button
            type="submit"
            disabled={isSaving || isLoadingAlert}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "12px 28px",
              backgroundColor: "#141414",
              border: "1px solid #262626",
              color: "#ffffff",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {isSaving ? "SAVING..." : "SAVE ALERT CONFIGURATION"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
