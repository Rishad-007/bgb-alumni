import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_AUTH_COOKIE = "admin_auth_token";

const buildToken = (password: string) =>
  createHash("sha256").update(`admin:${password}`).digest("hex");

const getConfiguredPassword = () => process.env.ADMIN_DASHBOARD_PASSWORD ?? "";

export const isAdminPasswordConfigured = () =>
  getConfiguredPassword().length > 0;

export const getAdminToken = () => {
  const password = getConfiguredPassword();
  if (!password) return "";
  return buildToken(password);
};

export const isAdminPasswordValid = (candidate: string) => {
  const password = getConfiguredPassword();
  if (!password || !candidate) return false;

  const expected = Buffer.from(buildToken(password));
  const actual = Buffer.from(buildToken(candidate));

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
};

export const isAdminCookieValid = (cookieValue: string | undefined) => {
  if (!cookieValue) return false;

  const expected = getAdminToken();
  if (!expected) return false;

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(cookieValue);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
};
