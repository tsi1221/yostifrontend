/** Live Yosti auth API base. */
export const AUTH_API_BASE = "https://yosti.nedhigibe.com/api";

/** POST { email, password } */
export const AUTH_LOGIN_URL = `${AUTH_API_BASE}/auth/login`;

/** POST { fullname, email, password, companyName, country, phoneWhatsapp, role, roleId } */
export const AUTH_REGISTER_URL = `${AUTH_API_BASE}/auth/register`;
