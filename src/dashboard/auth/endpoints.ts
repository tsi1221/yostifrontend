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

/** GET list / POST create / PATCH :id update / DELETE :id shipments */
export const SHIPMENTS_URL = `${AUTH_API_BASE}/shipments`;

/** GET list / POST create / GET :id / PATCH :id / DELETE :id inspection requests */
export const INSPECTIONS_URL = `${AUTH_API_BASE}/inspections`;

/** GET list / POST create / GET :id / PATCH :id / DELETE :id business trips */
export const TRIPS_URL = `${AUTH_API_BASE}/trips`;

/** GET paginated payments / POST create / GET :id receipt / PATCH :id { service, method, status } / DELETE :id */
export const PAYMENTS_URL = `${AUTH_API_BASE}/payments`;

/** POST create support tickets (try first; 201 { id, userId, orderReference, ... }) */
export const TICKETS_URL = `${AUTH_API_BASE}/tickets`;

/** Fallback when POST /tickets is 404 */
export const SUPPORT_URL = `${AUTH_API_BASE}/support`;

/** Live collection path used when /tickets and /support are 404 */
export const SUPPORTS_URL = `${AUTH_API_BASE}/supports`;
