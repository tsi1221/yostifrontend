/** Live Yosti auth API base. */
export const AUTH_API_BASE = "https://yosti.nedhigibe.com/api";

/** POST { email, password } */
export const AUTH_LOGIN_URL = `${AUTH_API_BASE}/auth/login`;

/** POST { fullname, email, password, companyName, country, phoneWhatsapp, role, roleId } */
export const AUTH_REGISTER_URL = `${AUTH_API_BASE}/auth/register`;

/** GET paginated users: page, pageSize, search, fullname, email, phoneWhatsapp, companyName, roleId */
export const USERS_URL = `${AUTH_API_BASE}/users`;

/** GET paginated sourcing requests: page, pageSize, search, supplierRegion, deadline */
export const REQUESTS_URL = `${AUTH_API_BASE}/requests`;

/** GET list / POST create / PATCH :id update shipments */
export const SHIPMENTS_URL = `${AUTH_API_BASE}/shipments`;
