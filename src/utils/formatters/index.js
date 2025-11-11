//src/utils/formatters/index.js
// ==============================
// 🧠 Universal Data Formatters
// ==============================

// ---------- Date & Time ----------
export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ---------- Roles ----------
export const formatRole = (role) => {
  if (!role) return "Unknown";
  const roleMap = {
    admin: "Admin",
    teacher: "Teacher",
    principal: "Principal",
    deputy: "Deputy Principal",
    driver: "Driver",
  };
  return roleMap[role] || role;
};

// ---------- Booking Status ----------
export const formatStatus = (status) => {
  if (!status) return "Unknown";
  const map = {
    PENDING: "Pending Approval",
    DEPUTY_APPROVED: "Deputy Approved",
    PRINCIPAL_APPROVED: "Principal Approved",
    REJECTED: "Rejected",
    CANCELED: "Canceled",
  };
  return map[status] || status;
};

// ---------- Text Utilities ----------
export const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncate = (text, maxLength = 40) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// ---------- Name / Email Formatting ----------
export const formatName = (user) => {
  if (!user) return "Unknown User";
  if (typeof user === "string") return capitalize(user);
  return `${capitalize(user.name || "Unknown")}`;
};

export const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email || "N/A";
  const [name, domain] = email.split("@");
  const maskedName = name.length > 3 ? name.slice(0, 3) + "***" : name[0] + "***";
  return `${maskedName}@${domain}`;
};

// ---------- Bus Info ----------
export const formatBus = (bus) => {
  if (!bus) return "No Bus Assigned";
  return `${bus.name || "Unnamed"} (${bus.plateNumber || "N/A"})`;
};

// ---------- Misc ----------
export const formatPhone = (phone) => {
  if (!phone) return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+254${cleaned.slice(1)}`;
  return `+254${cleaned}`;
};
