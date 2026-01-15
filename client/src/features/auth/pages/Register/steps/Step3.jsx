import React, { useEffect, useMemo, useState } from "react";

/** Handles birth date and gender selection with age validation logic */
const Step3 = ({ formData, setFormData, errors }) => {
  /** Parses YYYY-MM-DD string into date parts */
  const parseDob = (dob) => {
    if (!dob || typeof dob !== "string") return { y: "", m: "", d: "" };
    const match = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return { y: "", m: "", d: "" };
    return { y: match[1], m: match[2], d: match[3] };
  };

  const [dob, setDob] = useState(() => parseDob(formData.dateOfBirth));

  /** Syncs internal state with parent formData */
  useEffect(() => {
    const match = String(formData.dateOfBirth || "").match(/^\d{4}-\d{2}-\d{2}$/);
    if (match) setDob(parseDob(formData.dateOfBirth));
  }, [formData.dateOfBirth]);

  const months = useMemo(
    () => [
      { value: "01", label: "Jan" }, { value: "02", label: "Feb" },
      { value: "03", label: "Mar" }, { value: "04", label: "Apr" },
      { value: "05", label: "May" }, { value: "06", label: "Jun" },
      { value: "07", label: "Jul" }, { value: "08", label: "Aug" },
      { value: "09", label: "Sep" }, { value: "10", label: "Oct" },
      { value: "11", label: "Nov" }, { value: "12", label: "Dec" },
    ],
    []
  );

  /** Generates year list for age range 10-120 */
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - 10;
    const minYear = currentYear - 120;
    const arr = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(String(y));
    return arr;
  }, []);

  /** Returns max days in a specific month/year */
  const daysInMonth = (year, month) => {
    if (!year || !month) return 31;
    const yy = Number(year);
    const mm = Number(month);
    if (!Number.isFinite(yy) || !Number.isFinite(mm) || mm < 1 || mm > 12) return 31;
    return new Date(yy, mm, 0).getDate();
  };

  /** Dynamic day options based on month/year selection */
  const dayOptions = useMemo(() => {
    const count = daysInMonth(dob.y, dob.m);
    return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [dob.y, dob.m]);

  /** Updates internal state and parent data with day overflow adjustment */
  const updateDob = (part, value) => {
    setDob((prev) => {
      const next = { ...prev, [part]: value };

      if ((part === "y" || part === "m") && next.y && next.m && next.d) {
        const max = daysInMonth(next.y, next.m);
        if (Number(next.d) > max) next.d = String(max).padStart(2, "0");
      }

      const complete = next.y && next.m && next.d;
      setFormData({
        ...formData,
        dateOfBirth: complete ? `${next.y}-${next.m}-${next.d}` : "",
      });
      return next;
    });
  };

  const dobInvalid = Boolean(errors.dateOfBirth);
  const genderInvalid = Boolean(errors.gender);

  return (
    <div className="d-grid gap-3">
      <div>
        <label className="form-label mb-2">Date of birth</label>
        <div className="row g-2">
          <div className="col-4">
            <select
              className={`form-select form-select-lg rounded-pill ${dobInvalid ? "is-invalid" : ""}`}
              value={dob.d}
              onChange={(e) => updateDob("d", e.target.value)}
            >
              <option value="">Day</option>
              {dayOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-4">
            <select
              className={`form-select form-select-lg rounded-pill ${dobInvalid ? "is-invalid" : ""}`}
              value={dob.m}
              onChange={(e) => updateDob("m", e.target.value)}
            >
              <option value="">Month</option>
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="col-4">
            <select
              className={`form-select form-select-lg rounded-pill ${dobInvalid ? "is-invalid" : ""}`}
              value={dob.y}
              onChange={(e) => updateDob("y", e.target.value)}
            >
              <option value="">Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {dobInvalid && <div className="invalid-feedback d-block mt-1">{errors.dateOfBirth}</div>}
      </div>

      <div>
        <label className="form-label mb-2">Gender</label>
        <select
          className={`form-select form-select-lg rounded-pill ${genderInvalid ? "is-invalid" : ""}`}
          value={formData.gender || ""}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="" disabled>Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        {genderInvalid && <div className="invalid-feedback d-block mt-1">{errors.gender}</div>}
      </div>
    </div>
  );
};

export default Step3;