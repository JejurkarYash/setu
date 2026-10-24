import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Terminal,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { fetchProjectLogs } from "../../api/logApi";
import type { UsageLog } from "../../types";

export default function ProjectLogsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, isLoadingProjects, projectsError } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const [projectLogs, setProjectLogs] = useState<UsageLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [filterStatus, setFilterStatus] = useState<"all" | "200" | "429">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    fetchProjectLogs(projectId, pageSize, (currentPage - 1) * pageSize)
      .then((logs) => {
        if (!isMounted) return;
        setProjectLogs(logs);
        setHasNextPage(logs.length === pageSize);
      })
      .catch((error) => {
        if (!isMounted) return;
        setProjectLogs([]);
        setHasNextPage(false);
        setLoadError(
          error instanceof Error ? error.message : "Failed to load request logs",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId, currentPage, pageSize]);

  if (isLoadingProjects) {
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
        Loading project...
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
        {projectsError && (
          <p style={{ fontSize: "12px", color: "#f87171" }}>{projectsError}</p>
        )}
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

  // Filtered dataset
  const filteredLogs = projectLogs.filter((log) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "200" && log.status_code === 200) ||
      (filterStatus === "429" && log.status_code === 429);

    const matchesSearch =
      searchQuery.trim() === "" ||
      log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Total cost across filtered logs
  const totalCost = filteredLogs.reduce((acc, l) => acc + l.cost_usd, 0);

  const activePage = currentPage;
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;
  const paginatedLogs = filteredLogs;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (newPage <= currentPage || (newPage === currentPage + 1 && hasNextPage))) {
      setCurrentPage(newPage);
      setSelectedLog(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "12px 16px 80px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
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
              Request Logs
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Telemetry & Logs
            </h1>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#34D399",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: "#34D399",
                  borderRadius: "50%",
                }}
              />
              LIVE TELEMETRY
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "#8e8e8e", margin: 0 }}>
            Real-time HTTP proxy logs emitted asynchronously by Setu background
            Goroutines.
          </p>
        </div>

        {/* Total Cost Telemetry */}
        <div
          style={{
            padding: "10px 18px",
            backgroundColor: "#121212",
            border: "1px solid #222222",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <DollarSign size={16} color="#34D399" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              FILTERED COST
            </span>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              ${totalCost.toFixed(6)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "16px",
          backgroundColor: "#121212",
          border: "1px solid #222222",
          boxSizing: "border-box",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={14}
            color="#71717a"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search by model or log ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              height: "38px",
              paddingLeft: "36px",
              paddingRight: "12px",
              backgroundColor: "#171717",
              border: "1px solid #222222",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#ffffff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "#171717",
            border: "1px solid #222222",
            padding: "3px",
          }}
        >
          {(["all", "200", "429"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor:
                  filterStatus === status ? "#222222" : "transparent",
                color:
                  filterStatus === status
                    ? status === "200"
                      ? "#34D399"
                      : status === "429"
                        ? "#f87171"
                        : "#ffffff"
                    : "#71717a",
                border: "none",
                textTransform: "uppercase",
              }}
            >
              {status === "all"
                ? `ALL (${projectLogs.length})`
                : status === "200"
                  ? "200 OK"
                  : "429 BLOCKED"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Logs Table ────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#121212",
          border: "1px solid #222222",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            Loading telemetry records...
          </div>
        ) : loadError ? (
          <div
            role="alert"
            style={{
              padding: "48px 0",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#f87171",
            }}
          >
            {loadError}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            No telemetry records found matching the current criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #1f1f1f",
                    color: "#71717a",
                    fontSize: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  <th style={{ paddingBottom: "12px", paddingLeft: "8px" }}>
                    STATUS
                  </th>
                  <th style={{ paddingBottom: "12px" }}>MODEL</th>
                  <th style={{ paddingBottom: "12px" }}>
                    TOKENS (PROMPT / COMPL)
                  </th>
                  <th style={{ paddingBottom: "12px" }}>UPSTREAM COST</th>
                  <th
                    style={{
                      paddingBottom: "12px",
                      paddingRight: "8px",
                      textAlign: "right",
                    }}
                  >
                    TIMESTAMP
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const isBlocked = log.status_code === 429;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      style={{
                        borderBottom: "1px solid #1a1a1a",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#171717")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            fontWeight: 700,
                            backgroundColor: isBlocked
                              ? "rgba(248, 113, 113, 0.1)"
                              : "rgba(52, 211, 153, 0.1)",
                            color: isBlocked ? "#f87171" : "#34D399",
                            border: isBlocked
                              ? "1px solid rgba(248, 113, 113, 0.3)"
                              : "1px solid rgba(52, 211, 153, 0.3)",
                          }}
                        >
                          {log.status_code} {isBlocked ? "BLOCKED" : "OK"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          color: "#ffffff",
                          fontWeight: 600,
                        }}
                      >
                        {log.model}
                      </td>
                      <td style={{ padding: "12px", color: "#8e8e8e" }}>
                        {isBlocked ? (
                          <span style={{ color: "#71717a" }}>
                            Intercepted by Redis quota
                          </span>
                        ) : (
                          <span>
                            <strong style={{ color: "#ffffff" }}>
                              {log.prompt_tokens}
                            </strong>{" "}
                            in /{" "}
                            <strong style={{ color: "#ffffff" }}>
                              {log.completion_tokens}
                            </strong>{" "}
                            out
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          color: isBlocked ? "#34D399" : "#ffffff",
                          fontWeight: 600,
                        }}
                      >
                        {isBlocked
                          ? "$0.000000"
                          : `$${log.cost_usd.toFixed(6)}`}
                      </td>
                      <td
                        style={{
                          padding: "12px 8px",
                          textAlign: "right",
                          color: "#71717a",
                        }}
                      >
                        {log.created_at}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Controls Bar ────────────────────────────── */}
        {!isLoading && !loadError && projectLogs.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              paddingTop: "20px",
              marginTop: "8px",
              borderTop: "1px solid #1f1f1f",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#71717a",
            }}
          >
            {/* Page Size Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>ROWS PER PAGE:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page Indicator */}
            <div>
              SHOWING{" "}
              <strong style={{ color: "#ffffff" }}>
              {(activePage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong style={{ color: "#ffffff" }}>
              {(activePage - 1) * pageSize + filteredLogs.length}
              </strong>{" "}
              LOGS ON THIS PAGE
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => handlePageChange(1)}
                style={{
                  padding: "6px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: activePage === 1 ? "#3f3f46" : "#ffffff",
                  cursor: activePage === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
                style={{
                  padding: "6px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: activePage === 1 ? "#3f3f46" : "#ffffff",
                  cursor: activePage === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={14} />
              </button>

              <span
                style={{ padding: "0 8px", color: "#ffffff", fontWeight: 700 }}
              >
                {activePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
                style={{
                  padding: "6px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: activePage === totalPages ? "#3f3f46" : "#ffffff",
                  cursor: activePage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                style={{
                  padding: "6px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: activePage === totalPages ? "#3f3f46" : "#ffffff",
                  cursor: activePage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Log Detail Inspector Drawer ───────────────────────────── */}
      <AnimatePresence>
        {selectedLog && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                width: "100%",
                maxWidth: "480px",
                height: "100%",
                backgroundColor: "#121212",
                borderLeft: "1px solid #222222",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                boxSizing: "border-box",
                overflowY: "auto",
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Terminal size={16} color="#C084FC" />
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
                    LOG TELEMETRY DETAIL
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#71717a",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Fields */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#171717",
                    border: "1px solid #222222",
                  }}
                >
                  <span style={{ color: "#71717a" }}>LOG ID</span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {selectedLog.id}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#171717",
                    border: "1px solid #222222",
                  }}
                >
                  <span style={{ color: "#71717a" }}>HTTP STATUS</span>
                  <span
                    style={{
                      color:
                        selectedLog.status_code === 200 ? "#34D399" : "#f87171",
                      fontWeight: 700,
                    }}
                  >
                    {selectedLog.status_code}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px",
                    backgroundColor: "#171717",
                    border: "1px solid #222222",
                  }}
                >
                  <span style={{ color: "#71717a" }}>TARGET MODEL</span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {selectedLog.model}
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#171717",
                    border: "1px solid #222222",
                    color: "#8e8e8e",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#71717a",
                      fontWeight: 700,
                    }}
                  >
                    POSTGRES PAYLOAD DUMP
                  </p>
                  <pre
                    style={{
                      margin: 0,
                      color: "#34D399",
                      fontSize: "11px",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
