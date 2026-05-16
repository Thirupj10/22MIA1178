"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { fetchNotifications, Notification } from "../../lib/notifications";
import { Log } from "../../lib/logger";

const VIEWED_KEY = "viewed_notifications";

function getViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(VIEWED_KEY);
  return raw ? new Set(JSON.parse(raw)) : new Set();
}

function markViewed(id: string) {
  const viewed = getViewedIds();
  viewed.add(id);
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]));
}

const TYPE_CONFIG = {
  Placement: { color: "success" as const, icon: <WorkIcon fontSize="small" /> },
  Result: { color: "warning" as const, icon: <SchoolIcon fontSize="small" /> },
  Event: { color: "info" as const, icon: <EventIcon fontSize="small" /> },
};

const PAGE_SIZE = 5;

export default function AllNotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [filtered, setFiltered] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setViewedIds(getViewedIds());
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        await Log("frontend", "info", "page", "All Notifications page mounted");
        const notifs = await fetchNotifications();
        setAllNotifications(notifs);
        await Log("frontend", "info", "page", `Loaded ${notifs.length} total notifications`);
      } catch (err) {
        setError("Failed to load notifications.");
        await Log("frontend", "error", "page", `All Notifications load error: ${err}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = allNotifications;
    if (typeFilter !== "All") {
      result = allNotifications.filter((n) => n.Type === typeFilter);
    }
    setFiltered(result);
    setPage(1);
    Log("frontend", "info", "state", `Filter applied: ${typeFilter}, ${result.length} results`);
  }, [typeFilter, allNotifications]);

  function handleOpen(id: string) {
    markViewed(id);
    setViewedIds((prev) => new Set([...prev, id]));
  }

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const newCount = filtered.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <FormatListBulletedIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          All Notifications
        </Typography>
        {newCount > 0 && (
          <Chip label={`${newCount} New`} color="primary" size="small" />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={(_, val) => val && setTypeFilter(val)}
          size="small"
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="Placement">Placement</ToggleButton>
          <ToggleButton value="Result">Result</ToggleButton>
          <ToggleButton value="Event">Event</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select value={limit} label="Per Page" onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          {filtered.length} notifications
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && paginated.length === 0 && (
        <Alert severity="info">No notifications for this filter.</Alert>
      )}

      {!loading && !error && paginated.map((notif) => {
        const isNew = !viewedIds.has(notif.ID);
        const config = TYPE_CONFIG[notif.Type];
        return (
          <Card
            key={notif.ID}
            onClick={() => handleOpen(notif.ID)}
            sx={{
              mb: 2,
              cursor: "pointer",
              border: isNew ? "2px solid #1565C0" : "1px solid #e0e0e0",
              bgcolor: isNew ? "#EEF4FF" : "#fff",
              transition: "all 0.2s",
              "&:hover": { boxShadow: 4, transform: "translateY(-1px)" },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Badge color="primary" variant="dot" invisible={!isNew}>
                    <Chip icon={config.icon} label={notif.Type} color={config.color} size="small" />
                  </Badge>
                  {isNew && (
                    <Chip label="NEW" size="small" color="primary" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notif.Timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: isNew ? 600 : 400 }}>
                {notif.Message}
              </Typography>
            </CardContent>
          </Card>
        );
      })}

      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => {
              setPage(val);
              Log("frontend", "info", "state", `Navigated to page ${val}`);
            }}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}