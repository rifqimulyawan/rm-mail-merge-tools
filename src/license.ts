import type { LicenseState, LicenseType } from "./types";
import { FREE_USE_LIMIT, LICENSE_ENDPOINT, PURCHASE_URL } from "./types";

const STORAGE_KEY = "rmmmt_license";
const FREE_COUNT_KEY = "rmmmt_free_count";
const DEV_FLAG_KEY = "rmmmt_dev_activated";

function isDevMode(): boolean {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0"
  );
}

export function autoActivateDevMode(): LicenseState | null {
  if (!isDevMode()) return null;
  if (localStorage.getItem(DEV_FLAG_KEY) === "1") return getLicenseState();

  const devState: LicenseState = {
    type: "lifetime",
    freeUseCount: 0,
    activatedEmail: "dev@localhost",
    activationCode: "DEV-MODE",
    activatedAt: new Date().toISOString(),
  };
  saveLicenseState(devState);
  localStorage.setItem(DEV_FLAG_KEY, "1");
  return devState;
}

export function getLicenseState(): LicenseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const freeCount = parseInt(localStorage.getItem(FREE_COUNT_KEY) || "0", 10);
      return {
        type: freeCount > 0 ? "free" : "none",
        freeUseCount: freeCount,
        activatedEmail: "",
        activationCode: "",
        activatedAt: "",
      };
    }
    const parsed = JSON.parse(raw) as LicenseState;
    const freeCount = parseInt(localStorage.getItem(FREE_COUNT_KEY) || "0", 10);
    parsed.freeUseCount = freeCount;
    return parsed;
  } catch {
    return {
      type: "none",
      freeUseCount: 0,
      activatedEmail: "",
      activationCode: "",
      activatedAt: "",
    };
  }
}

export function saveLicenseState(state: LicenseState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(FREE_COUNT_KEY, String(state.freeUseCount));
}

export function activateFreeTrial(): LicenseState {
  const current = getLicenseState();
  const newState: LicenseState = {
    ...current,
    type: "free",
    freeUseCount: 0,
  };
  saveLicenseState(newState);
  return newState;
}

export function incrementFreeUse(): LicenseState {
  const current = getLicenseState();
  if (current.type === "free") {
    const newCount = current.freeUseCount + 1;
    const newState: LicenseState = {
      ...current,
      freeUseCount: newCount,
    };
    saveLicenseState(newState);
    return newState;
  }
  return current;
}

const LICENSE_DURATION_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export function isAccessGranted(state: LicenseState): boolean {
  if (state.type === "lifetime") {
    if (!state.activatedAt) return false;
    const activatedTime = new Date(state.activatedAt).getTime();
    if (isNaN(activatedTime)) return false;
    return Date.now() - activatedTime < LICENSE_DURATION_MS;
  }
  if (state.type === "free" && state.freeUseCount < FREE_USE_LIMIT) return true;
  return false;
}

export function getRemainingFreeUses(state: LicenseState): number {
  return Math.max(0, FREE_USE_LIMIT - state.freeUseCount);
}

export function resetLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FREE_COUNT_KEY);
}

export interface ActivationResult {
  success: boolean;
  message: string;
  alreadyUsed: boolean;
  notRegistered: boolean;
  expired: boolean;
}

export async function activateLicense(
  activationCode: string,
  email: string
): Promise<ActivationResult> {
  const url = `${LICENSE_ENDPOINT}?aktivasi-rmmt=${encodeURIComponent(activationCode)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok && response.status !== 404) {
      return {
        success: false,
        message: "Gagal melakukan aktivasi. Periksa koneksi internet Anda.",
        alreadyUsed: false,
        notRegistered: false,
        expired: false,
      };
    }

    const htmlContent = await response.text();
    const lowerContent = htmlContent.toLowerCase();

    const emailLower = email.toLowerCase().trim();
    const emailFound = lowerContent.includes(emailLower);

    if (htmlContent.includes("RMMMT") && emailFound) {
      const newState: LicenseState = {
        type: "lifetime",
        freeUseCount: 0,
        activatedEmail: email,
        activationCode,
        activatedAt: new Date().toISOString(),
      };
      saveLicenseState(newState);
      return {
        success: true,
        message: "Aktivasi RMMMT Berhasil!",
        alreadyUsed: false,
        notRegistered: false,
        expired: false,
      };
    }

    if (htmlContent.includes("False") || (!emailFound && !htmlContent.includes("RMMMT"))) {
      if (lowerContent.includes("used") || lowerContent.includes("digunakan")) {
        return {
          success: false,
          message: "Gagal! Kode ini telah digunakan sebelumnya.",
          alreadyUsed: true,
          notRegistered: false,
          expired: false,
        };
      }
      if (lowerContent.includes("expired") || lowerContent.includes("kadaluarsa")) {
        return {
          success: false,
          message: "Kode aktivasi Anda sudah kadaluarsa! Silahkan perbarui kode aktivasi Anda.",
          alreadyUsed: false,
          notRegistered: false,
          expired: true,
        };
      }
      return {
        success: false,
        message: "Gagal! Kode aktivasi tidak terdaftar di database.",
        alreadyUsed: false,
        notRegistered: true,
        expired: false,
      };
    }

    return {
      success: false,
      message: "Gagal! Kode aktivasi tidak terdaftar di database.",
      alreadyUsed: false,
      notRegistered: true,
      expired: false,
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal melakukan aktivasi. Periksa koneksi internet Anda.",
      alreadyUsed: false,
      notRegistered: false,
      expired: false,
    };
  }
}

export { PURCHASE_URL };
