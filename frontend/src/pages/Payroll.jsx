
import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/client";
import "../styles/Payroll.css";

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = localDateString(new Date());
const monthStart = localDateString(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
);

const getWorkerName = (worker) => {
  if (!worker) return "Unknown worker";
  if (typeof worker === "string") return worker;

  return (
    worker.full_name ||
    worker.name ||
    worker.user?.full_name ||
    worker.user?.username ||
    worker.username ||
    `Worker #${worker.id ?? "—"}`
  );
};

const getProfileUserId = (labour) => {
  const user = labour?.user ?? labour?.user_id;

  if (user && typeof user === "object") {
    return String(user.id ?? user.pk ?? user.user_id ?? "");
  }

  return String(user ?? "");
};

const getAttendanceUserId = (record) => {
  const worker =
    record?.labour ?? record?.labour_id ?? record?.worker ?? record?.user;

  if (worker && typeof worker === "object") {
    if (worker.user && typeof worker.user === "object") {
      return String(worker.user.id ?? worker.user.pk ?? "");
    }

    if (worker.user !== undefined && worker.user !== null) {
      return String(worker.user);
    }

    return String(
      worker.id ?? worker.pk ?? worker.user_id ?? worker.labour_id ?? ""
    );
  }

  return String(worker ?? "");
};

const getAttendanceDate = (record) =>
  String(record?.date ?? record?.attendance_date ?? "").slice(0, 10);

const getAttendanceStatus = (record) =>
  String(record?.status ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const getEstateId = (labour) => {
  const estate = labour?.estate ?? labour?.estate_id;

  if (estate && typeof estate === "object") {
    return String(estate.id ?? estate.pk ?? "");
  }

  return String(estate ?? "");
};

const getEstateName = (labour) => {
  const estate = labour?.estate;

  if (estate && typeof estate === "object") {
    return estate.name || estate.estate_name || `Estate #${estate.id}`;
  }

  if (labour?.estate_name) return labour.estate_name;

  if (estate !== undefined && estate !== null && estate !== "") {
    return `Estate #${estate}`;
  }

  if (labour?.estate_id) return `Estate #${labour.estate_id}`;

  return "Not assigned";
};

const getPhone = (labour) =>
  labour?.phone_number ||
  labour?.phone ||
  labour?.user?.phone_number ||
  labour?.user?.phone ||
  "—";

const getDailyWage = (labour) =>
  Number(labour?.daily_wage ?? labour?.wage_per_day ?? 0);

const getStatusLabel = (row) => {
  if (row.attendanceCount === 0) return "No attendance";
  if (row.calculatedWage <= 0) return "No wages";
  return "Estimated";
};

const getApiErrorMessage = (error) => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    return "The server returned an error. Check the backend terminal for details.";
  }

  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    if (data.detail) return String(data.detail);

    return Object.entries(data)
      .map(([field, value]) => {
        const detail = Array.isArray(value)
          ? value.map((item) =>
              typeof item === "string" ? item : JSON.stringify(item)
            ).join(", ")
          : typeof value === "string"
          ? value
          : JSON.stringify(value);

        return `${field}: ${detail}`;
      })
      .join(" | ");
  }

  return error?.message || "An unexpected error occurred. Please try again.";
};

const Payroll = () => {
  const [labourers, setLabourers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [wagePayments, setWagePayments] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [estateFilter, setEstateFilter] = useState("ALL");
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const [paymentWorker, setPaymentWorker] = useState(null);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: today,
    payment_method: "CASH",
    transaction_reference: "",
    remarks: "",
  });

  const loadPayroll = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const results = await Promise.allSettled([
        API.get("labour-profiles/"),
        API.get("attendance/"),
        API.get("labour-wage-payments/"),
      ]);

      if (results[0].status === "fulfilled") {
        setLabourers(getArray(results[0].value.data));
      } else {
        setLabourers([]);
        setError("Could not load labour profiles.");
      }

      if (results[1].status === "fulfilled") {
        setAttendance(getArray(results[1].value.data));
      } else {
        setAttendance([]);
        setError((previous) =>
          [previous, "Could not load attendance records."]
            .filter(Boolean)
            .join(" ")
        );
      }

      if (results[2].status === "fulfilled") {
        setWagePayments(getArray(results[2].value.data));
      } else {
        setWagePayments([]);
        console.warn(
          "Could not load wage payment history:",
          results[2].reason
        );
      }
    } catch (err) {
      console.error("Payroll loading error:", err);
      setError("Unable to load payroll data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  const estateOptions = useMemo(() => {
    const map = new Map();

    labourers.forEach((labour) => {
      const id = getEstateId(labour);
      if (id) map.set(id, getEstateName(labour));
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [labourers]);

  const attendanceInPeriod = useMemo(
    () =>
      attendance.filter((record) => {
        const date = getAttendanceDate(record);
        if (!date) return false;
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      }),
    [attendance, startDate, endDate]
  );

  const attendanceSummary = useMemo(() => {
    const summary = {};

    attendanceInPeriod.forEach((record) => {
      const userId = getAttendanceUserId(record);
      if (!userId) return;

      if (!summary[userId]) {
        summary[userId] = {
          present: 0,
          halfDay: 0,
          absent: 0,
          payableDays: 0,
          attendanceCount: 0,
        };
      }

      const item = summary[userId];
      const status = getAttendanceStatus(record);
      item.attendanceCount += 1;

      if (status === "PRESENT") {
        item.present += 1;
        item.payableDays += 1;
      } else if (status === "HALF_DAY") {
        item.halfDay += 1;
        item.payableDays += 0.5;
      } else if (status === "ABSENT") {
        item.absent += 1;
      }
    });

    return summary;
  }, [attendanceInPeriod]);

  const payrollRows = useMemo(
    () =>
      labourers.map((labour) => {
        const userId = getProfileUserId(labour);
        const summary = attendanceSummary[userId] || {
          present: 0,
          halfDay: 0,
          absent: 0,
          payableDays: 0,
          attendanceCount: 0,
        };

        const dailyWage = getDailyWage(labour);
        const calculatedWage = summary.payableDays * dailyWage;

        const row = {
          id: labour.id,
          userId,
          name: getWorkerName(labour),
          phone: getPhone(labour),
          estate: getEstateName(labour),
          estateId: getEstateId(labour),
          present: summary.present,
          halfDay: summary.halfDay,
          absent: summary.absent,
          payableDays: summary.payableDays,
          attendanceCount: summary.attendanceCount,
          dailyWage,
          calculatedWage,
        };

        return { ...row, status: getStatusLabel(row) };
      }),
    [labourers, attendanceSummary]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payrollRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        String(row.phone).toLowerCase().includes(query) ||
        row.estate.toLowerCase().includes(query) ||
        String(row.id).includes(query);

      const matchesEstate =
        estateFilter === "ALL" || row.estateId === estateFilter;

      let matchesStatus = true;
      if (statusFilter === "HAS_ATTENDANCE") {
        matchesStatus = row.attendanceCount > 0;
      } else if (statusFilter === "NO_ATTENDANCE") {
        matchesStatus = row.attendanceCount === 0;
      } else if (statusFilter === "HAS_WAGES") {
        matchesStatus = row.calculatedWage > 0;
      }

      return matchesSearch && matchesEstate && matchesStatus;
    });
  }, [payrollRows, search, estateFilter, statusFilter]);

  const totals = useMemo(
    () =>
      filteredRows.reduce(
        (result, row) => {
          result.labourers += 1;
          result.present += row.present;
          result.halfDay += row.halfDay;
          result.absent += row.absent;
          result.payableDays += row.payableDays;
          result.calculatedWage += row.calculatedWage;

          if (row.attendanceCount > 0) result.workersWithAttendance += 1;
          return result;
        },
        {
          labourers: 0,
          present: 0,
          halfDay: 0,
          absent: 0,
          payableDays: 0,
          calculatedWage: 0,
          workersWithAttendance: 0,
        }
      ),
    [filteredRows]
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setEstateFilter("ALL");
    setStartDate(monthStart);
    setEndDate(today);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    if (endDate && value && value > endDate) setEndDate(value);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    if (startDate && value && value < startDate) setStartDate(value);
  };

  const exportPayrollCsv = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const response = await API.get("export/payroll/", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv;charset=utf-8;" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "payroll.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Payroll CSV export error:", err);
      setError(
        `Could not export payroll CSV. ${getApiErrorMessage(err)}`
      );
    } finally {
      setExporting(false);
    }
  };

  const openPaymentModal = (worker) => {
    setPaymentWorker(worker);
    setPaymentError("");
    setPaymentSuccess("");

    setPaymentForm({
      amount: worker.calculatedWage.toFixed(2),
      payment_date: today,
      payment_method: "CASH",
      transaction_reference: "",
      remarks: "",
    });
  };

  const closePaymentModal = () => {
    if (paymentSaving) return;
    setPaymentWorker(null);
    setPaymentError("");
    setPaymentSuccess("");
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();

    if (!paymentWorker || paymentSaving || paymentSuccess) return;

    if (!paymentWorker.userId || !paymentWorker.estateId) {
      setPaymentError(
        "The labourer's user ID or estate ID is missing. Check the labour profile API response."
      );
      return;
    }

    const amount = Number(paymentForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a payment amount greater than zero.");
      return;
    }

    if (amount > paymentWorker.calculatedWage) {
      setPaymentError(
        "The payment cannot exceed the estimated wages for this selected period."
      );
      return;
    }

    if (
      !paymentForm.payment_date ||
      !startDate ||
      !endDate ||
      startDate > endDate
    ) {
      setPaymentError("Please select a valid payment date and payroll period.");
      return;
    }

    if (paymentWorker.calculatedWage <= 0) {
      setPaymentError("No wages are estimated for this worker in this period.");
      return;
    }

    const paymentData = {
      labour: Number(paymentWorker.userId),
      estate: Number(paymentWorker.estateId),
      period_start: startDate,
      period_end: endDate,
      amount: amount.toFixed(2),
      payment_date: paymentForm.payment_date,
      payment_method: paymentForm.payment_method,
      transaction_reference: paymentForm.transaction_reference.trim(),
      remarks: paymentForm.remarks.trim(),
    };

    setPaymentSaving(true);
    setPaymentError("");

    try {
      await API.post("labour-wage-payments/", paymentData);
      setPaymentSuccess("Labour wage payment recorded successfully.");
      await loadPayroll(true);
    } catch (err) {
      console.error(
        "Labour wage payment error:",
        err.response?.data || err
      );
      setPaymentError(getApiErrorMessage(err));
    } finally {
      setPaymentSaving(false);
    }
  };

  const paidForWorker = (worker) =>
    wagePayments
      .filter(
        (payment) =>
          String(payment.labour) === String(worker.userId) &&
          String(payment.estate) === String(worker.estateId) &&
          payment.status === "PAID" &&
          payment.period_start === startDate &&
          payment.period_end === endDate
      )
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <div className="payroll-page">
      <div className="payroll-header">
        <div className="payroll-header-content">
          <div className="payroll-eyebrow">WORKFORCE MANAGEMENT</div>
          <h1>Payroll Management</h1>
          <p>
            Review attendance and estimate labour wages for your selected
            period.
          </p>
        </div>

        <div className="payroll-header-actions">
          <button
            type="button"
            className="payroll-export-btn"
            onClick={exportPayrollCsv}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "↓ Export CSV"}
          </button>

          <button
            type="button"
            className="payroll-refresh-btn"
            onClick={() => loadPayroll(true)}
            disabled={loading || refreshing}
          >
            <span className={refreshing ? "payroll-spin" : ""}>↻</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="payroll-error" role="alert">
          <span>!</span>
          <div>{error}</div>
          <button type="button" onClick={() => loadPayroll(true)}>
            Retry
          </button>
        </div>
      )}

      <div className="payroll-summary">
        <div className="payroll-summary-card payroll-summary-primary">
          <div className="payroll-summary-top">
            <span className="payroll-summary-label">Estimated Wages</span>
            <span className="payroll-icon">₹</span>
          </div>
          <div className="payroll-summary-value">
            {loading ? "—" : money(totals.calculatedWage)}
          </div>
          <div className="payroll-summary-description">
            Based on recorded attendance
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-top">
            <span className="payroll-summary-label">Payable Days</span>
            <span className="payroll-icon payroll-icon-blue">◷</span>
          </div>
          <div className="payroll-summary-value">
            {loading ? "—" : totals.payableDays.toLocaleString("en-IN")}
          </div>
          <div className="payroll-summary-description">
            Present days plus half days
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-top">
            <span className="payroll-summary-label">
              Workers With Attendance
            </span>
            <span className="payroll-icon payroll-icon-orange">♙</span>
          </div>
          <div className="payroll-summary-value">
            {loading ? "—" : totals.workersWithAttendance}
          </div>
          <div className="payroll-summary-description">
            Workers recorded in this period
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-top">
            <span className="payroll-summary-label">Labourers</span>
            <span className="payroll-icon payroll-icon-purple">♧</span>
          </div>
          <div className="payroll-summary-value">
            {loading ? "—" : totals.labourers}
          </div>
          <div className="payroll-summary-description">
            Labour profiles matching filters
          </div>
        </div>
      </div>

      <section className="payroll-panel">
        <div className="payroll-panel-heading">
          <div>
            <h2>Labour Wage Estimates</h2>
            <p>
              Calculations use the daily wage in each labour profile and
              attendance recorded within the selected dates.
            </p>
          </div>
          <span className="payroll-count">
            {loading ? "Loading..." : `${filteredRows.length} workers`}
          </span>
        </div>

        <div className="payroll-filters">
          <div className="payroll-filter-field payroll-search-field">
            <label htmlFor="payroll-search">Search labourer</label>
            <div className="payroll-search-box">
              <span aria-hidden="true">⌕</span>
              <input
                id="payroll-search"
                type="search"
                placeholder="Search name, phone or estate..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="payroll-filter-field">
            <label htmlFor="payroll-start-date">From date</label>
            <input
              id="payroll-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => handleStartDateChange(event.target.value)}
            />
          </div>

          <div className="payroll-filter-field">
            <label htmlFor="payroll-end-date">To date</label>
            <input
              id="payroll-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => handleEndDateChange(event.target.value)}
            />
          </div>

          <div className="payroll-filter-field">
            <label htmlFor="payroll-estate-filter">Estate</label>
            <select
              id="payroll-estate-filter"
              value={estateFilter}
              onChange={(event) => setEstateFilter(event.target.value)}
            >
              <option value="ALL">All estates</option>
              {estateOptions.map((estate) => (
                <option key={estate.id} value={estate.id}>
                  {estate.name}
                </option>
              ))}
            </select>
          </div>

          <div className="payroll-filter-field">
            <label htmlFor="payroll-status-filter">Attendance status</label>
            <select
              id="payroll-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All labourers</option>
              <option value="HAS_ATTENDANCE">Has attendance</option>
              <option value="NO_ATTENDANCE">No attendance</option>
              <option value="HAS_WAGES">Has estimated wages</option>
            </select>
          </div>

          <button
            type="button"
            className="payroll-reset-btn"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>

        <div className="payroll-table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Labourer</th>
                <th>Estate</th>
                <th>Present</th>
                <th>Half days</th>
                <th>Absent</th>
                <th>Payable days</th>
                <th>Daily wage</th>
                <th>Estimated wages</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                filteredRows.map((row) => {
                  const paid = paidForWorker(row);
                  const balance = Math.max(row.calculatedWage - paid, 0);

                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="payroll-worker">
                          <div className="payroll-avatar">
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="payroll-worker-details">
                            <span className="payroll-worker-name">
                              {row.name}
                            </span>
                            <span className="payroll-worker-phone">
                              {row.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{row.estate}</td>
                      <td>
                        <span className="payroll-number payroll-number-present">
                          {row.present}
                        </span>
                      </td>
                      <td>
                        <span className="payroll-number payroll-number-half">
                          {row.halfDay}
                        </span>
                      </td>
                      <td>
                        <span className="payroll-number payroll-number-absent">
                          {row.absent}
                        </span>
                      </td>
                      <td>{row.payableDays}</td>
                      <td>{money(row.dailyWage)}</td>
                      <td className="payroll-money">
                        {money(row.calculatedWage)}
                      </td>
                      <td>{money(paid)}</td>
                      <td className="payroll-money">{money(balance)}</td>
                      <td>
                        <span
                          className={`payroll-status ${
                            row.attendanceCount === 0
                              ? "payroll-status-muted"
                              : balance <= 0
                              ? "payroll-status-paid"
                              : row.calculatedWage > 0
                              ? "payroll-status-estimated"
                              : "payroll-status-warning"
                          }`}
                        >
                          {row.attendanceCount === 0
                            ? "No attendance"
                            : balance <= 0
                            ? "Paid"
                            : paid > 0
                            ? "Part paid"
                            : row.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="payroll-payment-btn"
                          onClick={() => openPaymentModal(row)}
                          disabled={
                            balance <= 0 ||
                            !row.userId ||
                            !row.estateId
                          }
                        >
                          {paid > 0 ? "Pay balance" : "Record payment"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan="12">
                    <div className="payroll-empty">
                      <div className="payroll-empty-icon">♧</div>
                      <h3>No labourers found</h3>
                      <p>
                        Try changing the search, estate, attendance status or
                        date range.
                      </p>
                      <button
                        type="button"
                        className="payroll-reset-btn"
                        onClick={resetFilters}
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="12">
                    <div className="payroll-loading">
                      <span className="payroll-loader" />
                      Loading payroll data...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {!loading && filteredRows.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="2">Filtered total</td>
                  <td>{totals.present}</td>
                  <td>{totals.halfDay}</td>
                  <td>{totals.absent}</td>
                  <td>{totals.payableDays}</td>
                  <td>—</td>
                  <td className="payroll-money">
                    {money(totals.calculatedWage)}
                  </td>
                  <td>—</td>
                  <td>—</td>
                  <td colSpan="2">Estimate only</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="payroll-note">
          <span className="payroll-note-icon">i</span>
          <p>
            <strong>Important:</strong> The table estimates wages from
            attendance. Wage payments are stored separately from B2B invoice
            payments. Recording a payment does not automatically transfer money.
            The CSV export uses the current backend export endpoint.
          </p>
        </div>
      </section>

      {paymentWorker && (
        <div
          className="payroll-modal-overlay"
          onClick={closePaymentModal}
          role="presentation"
        >
          <div
            className="payroll-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payroll-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="payroll-modal-icon">₹</div>

            <h2 id="payroll-modal-title">
              {paymentSuccess ? "Payment Recorded" : "Record Labour Wage Payment"}
            </h2>

            <p>
              Labourer: <strong>{paymentWorker.name}</strong>
            </p>
            <p>
              Estate: <strong>{paymentWorker.estate}</strong>
            </p>
            <p>
              Estimated wages:{" "}
              <strong>{money(paymentWorker.calculatedWage)}</strong>
            </p>
            <p>
              Previously paid:{" "}
              <strong>{money(paidForWorker(paymentWorker))}</strong>
            </p>
            <p>
              Remaining estimate:{" "}
              <strong>
                {money(
                  Math.max(
                    paymentWorker.calculatedWage -
                      paidForWorker(paymentWorker),
                    0
                  )
                )}
              </strong>
            </p>

            {paymentSuccess ? (
              <>
                <p role="status" className="payroll-payment-success">
                  {paymentSuccess}
                </p>
                <div className="payroll-modal-actions">
                  <button
                    type="button"
                    className="payroll-modal-close"
                    onClick={closePaymentModal}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleRecordPayment}>
                <div className="payroll-filter-field">
                  <label htmlFor="wage-amount">Payment amount (₹)</label>
                  <input
                    id="wage-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={Math.max(
                      paymentWorker.calculatedWage -
                        paidForWorker(paymentWorker),
                      0
                    )}
                    required
                    value={paymentForm.amount}
                    onChange={(event) =>
                      setPaymentForm((previous) => ({
                        ...previous,
                        amount: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="payroll-filter-field">
                  <label htmlFor="wage-payment-date">Payment date</label>
                  <input
                    id="wage-payment-date"
                    type="date"
                    required
                    value={paymentForm.payment_date}
                    onChange={(event) =>
                      setPaymentForm((previous) => ({
                        ...previous,
                        payment_date: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="payroll-filter-field">
                  <label htmlFor="wage-payment-method">Payment method</label>
                  <select
                    id="wage-payment-method"
                    required
                    value={paymentForm.payment_method}
                    onChange={(event) =>
                      setPaymentForm((previous) => ({
                        ...previous,
                        payment_method: event.target.value,
                      }))
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="RAZORPAY">Razorpay</option>
                  </select>
                </div>

                <div className="payroll-filter-field">
                  <label htmlFor="wage-transaction-reference">
                    Transaction reference (optional)
                  </label>
                  <input
                    id="wage-transaction-reference"
                    type="text"
                    value={paymentForm.transaction_reference}
                    onChange={(event) =>
                      setPaymentForm((previous) => ({
                        ...previous,
                        transaction_reference: event.target.value,
                      }))
                    }
                    placeholder="Transaction ID or receipt number"
                  />
                </div>

                <div className="payroll-filter-field">
                  <label htmlFor="wage-remarks">Remarks (optional)</label>
                  <textarea
                    id="wage-remarks"
                    rows="3"
                    value={paymentForm.remarks}
                    onChange={(event) =>
                      setPaymentForm((previous) => ({
                        ...previous,
                        remarks: event.target.value,
                      }))
                    }
                    placeholder="Payment notes..."
                  />
                </div>

                {paymentError && (
                  <div className="payroll-error" role="alert">
                    {paymentError}
                  </div>
                )}

                <div className="payroll-modal-actions">
                  <button
                    type="button"
                    className="payroll-modal-close"
                    disabled={paymentSaving}
                    onClick={closePaymentModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="payroll-payment-btn"
                    disabled={paymentSaving}
                  >
                    {paymentSaving ? "Recording..." : "Confirm Payment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
