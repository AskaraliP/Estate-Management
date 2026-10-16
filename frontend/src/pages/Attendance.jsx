
import React, { useEffect, useState, useCallback } from "react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import "../styles/Attendance.css";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getLabourUserId = (labour) => {
  if (labour?.user && typeof labour.user === "object") {
    return labour.user.id ?? labour.user_id ?? labour.id;
  }

  return labour?.user ?? labour?.user_id ?? labour?.id;
};

const getLabourName = (labour) =>
  labour?.full_name ||
  labour?.name ||
  labour?.user?.full_name ||
  labour?.user?.username ||
  labour?.username ||
  `Labour #${getLabourUserId(labour) ?? "—"}`;

const getAttendanceLabourName = (item) =>
  item?.labour_name ||
  item?.labour_full_name ||
  item?.labour_details?.full_name ||
  item?.labour_details?.name ||
  item?.labour_details?.user?.full_name ||
  item?.labour_details?.user?.username ||
  item?.labour?.username ||
  `Labour #${item?.labour?.id ?? item?.labour ?? "—"}`;

const getLabourEstateId = (labour) => {
  if (labour?.estate && typeof labour.estate === "object") {
    return labour.estate.id;
  }

  return labour?.estate ?? labour?.estate_id ?? null;
};

const getErrorMessage = (err) => {
  const data = err.response?.data;

  if (!data) {
    return "Unable to connect to the backend. Check that Django is running.";
  }

  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;

  return Object.entries(data)
    .map(([key, value]) => {
      const message = Array.isArray(value)
        ? value.join(", ")
        : typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);

      return `${key}: ${message}`;
    })
    .join(" | ");
};

export default function Attendance() {
  const { user } = useAuth();

  const role = normalizeRole(
    user?.role ||
      user?.user_role ||
      user?.user_type ||
      user?.profile?.role ||
      localStorage.getItem("user_role") ||
      localStorage.getItem("role")
  );

  const isAdmin = Boolean(
    user?.is_staff ||
      user?.is_superuser ||
      ["admin", "administrator", "superuser"].includes(role)
  );

  const isEstateOwner = [
    "estate_owner",
    "estateowner",
    "owner",
  ].includes(role);

  const canManage = isAdmin || isEstateOwner;

  const [attendance, setAttendance] = useState([]);
  const [labours, setLabours] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    estate: "",
    labour: "",
    date: getTodayDate(),
    status: "PRESENT",
    notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const attendanceResponse = await API.get("attendance/");
      setAttendance(getList(attendanceResponse.data));

      if (canManage) {
        const [labourResponse, estateResponse] = await Promise.all([
          API.get("labour-profiles/"),
          API.get("estates/"),
        ]);

        setLabours(getList(labourResponse.data));
        setEstates(getList(estateResponse.data));
      } else {
        setLabours([]);
        setEstates([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedLabours = labours.filter(
    (labour) =>
      String(getLabourEstateId(labour)) === String(form.estate)
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!canManage) {
      setError("You do not have permission to mark attendance.");
      return;
    }

    if (!form.estate || !form.labour || !form.date) {
      setError("Please select an estate, labourer, and date.");
      return;
    }

    const selectedLabour = selectedLabours.find(
      (labour) =>
        String(getLabourUserId(labour)) === String(form.labour)
    );

    if (!selectedLabour) {
      setError("Select a valid labourer assigned to this estate.");
      return;
    }

    setSaving(true);

    try {
      await API.post("attendance/", {
        estate: Number(form.estate),
        labour: Number(form.labour),
        date: form.date,
        status: form.status,
        remarks: form.notes.trim(),
      });

      setMessage("Attendance recorded successfully.");

      setForm((previous) => ({
        ...previous,
        labour: "",
        status: "PRESENT",
        notes: "",
      }));

      const attendanceResponse = await API.get("attendance/");
      setAttendance(getList(attendanceResponse.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const filteredAttendance = attendance.filter((item) => {
    const query = search.trim().toLowerCase();
    const labourName = getAttendanceLabourName(item);

    return (
      String(labourName).toLowerCase().includes(query) ||
      String(item.status || "").toLowerCase().includes(query) ||
      String(item.date || "").includes(query) ||
      String(item.estate_name || "").toLowerCase().includes(query)
    );
  });

  function statusIcon(status) {
    switch (String(status || "").toUpperCase()) {
      case "PRESENT":
        return <CheckCircle2 size={16} />;
      case "HALF_DAY":
        return <Clock size={16} />;
      default:
        return <XCircle size={16} />;
    }
  }

  return (
    <div className="attendance-page">
      <div className="page-heading">
        <div>
          <h1>Labour Attendance</h1>
          <p>Record and review daily rubber estate attendance.</p>
        </div>

        <button
          type="button"
          className="attendance-refresh"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="attendance-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="attendance-error" role="alert">
          {error}
        </div>
      )}

      {canManage && (
        <form className="attendance-form" onSubmit={handleSubmit}>
          <h2>Mark Attendance</h2>

          <div className="attendance-form-grid">
            <div className="attendance-field">
              <label htmlFor="attendance-estate">Estate</label>

              <select
                id="attendance-estate"
                value={form.estate}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    estate: event.target.value,
                    labour: "",
                  }))
                }
                required
              >
                <option value="">Select estate</option>

                {estates.map((estate) => (
                  <option key={estate.id} value={estate.id}>
                    {estate.name || `Estate #${estate.id}`}
                  </option>
                ))}
              </select>

              {!loading && estates.length === 0 && (
                <small>No estates were returned by the API.</small>
              )}
            </div>

            <div className="attendance-field">
              <label htmlFor="attendance-labour">Labourer</label>

              <select
                id="attendance-labour"
                value={form.labour}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    labour: event.target.value,
                  }))
                }
                required
                disabled={!form.estate || selectedLabours.length === 0}
              >
                <option value="">Select labourer</option>

                {selectedLabours.map((labour, index) => {
                  const labourUserId = getLabourUserId(labour);

                  if (labourUserId == null) return null;

                  return (
                    <option
                      key={labour.id ?? labourUserId ?? index}
                      value={labourUserId}
                    >
                      {getLabourName(labour)}
                    </option>
                  );
                })}
              </select>

              {form.estate &&
                !loading &&
                selectedLabours.length === 0 && (
                  <small>No labourers found for this estate.</small>
                )}
            </div>

            <div className="attendance-field">
              <label htmlFor="attendance-date">Date</label>

              <input
                id="attendance-date"
                type="date"
                value={form.date}
                max={getTodayDate()}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    date: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="attendance-field">
              <label htmlFor="attendance-status">Status</label>

              <select
                id="attendance-status"
                value={form.status}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    status: event.target.value,
                  }))
                }
              >
                <option value="PRESENT">Present</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            <div className="attendance-field">
              <label htmlFor="attendance-notes">
                Notes (optional)
              </label>

              <input
                id="attendance-notes"
                type="text"
                placeholder="Add a note"
                value={form.notes}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="attendance-submit"
            disabled={
              saving ||
              loading ||
              !form.estate ||
              !form.labour
            }
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </form>
      )}

      <div className="attendance-history">
        <div className="attendance-history-heading">
          <div>
            <h2>Attendance History</h2>
            <p>{filteredAttendance.length} record(s)</p>
          </div>

          <div className="attendance-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search name, date, status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="attendance-empty">Loading attendance...</p>
        ) : filteredAttendance.length === 0 ? (
          <div className="attendance-empty">
            <CalendarDays size={32} />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Estate</th>
                  <th>Labourer</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map((item) => {
                  const status = String(
                    item.status || "UNKNOWN"
                  ).toUpperCase();

                  return (
                    <tr key={item.id}>
                      <td>{item.date || "—"}</td>
                      <td>{item.estate_name || "—"}</td>
                      <td>{getAttendanceLabourName(item)}</td>

                      <td>
                        <span
                          className={`attendance-status ${status.toLowerCase()}`}
                        >
                          {statusIcon(status)}
                          {status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td>{item.remarks || item.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
