import CryptoJS from "crypto-js";

// Helper to check if we are running in Electron and can access IPC
const getIpcRenderer = () => {
  if (typeof window !== "undefined" && (window as any).require) {
    try {
      const electron = (window as any).require("electron");
      return electron.ipcRenderer;
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Encrypts data either using the native OS Keychain (via Electron) or falling back
 * to standard AES encryption via crypto-js if running purely in a web browser.
 */
export const encryptData = async (plainText: string, masterKey?: string): Promise<string> => {
  if (!plainText) return "";

  const ipcRenderer = getIpcRenderer();
  
  if (ipcRenderer) {
    // Try to use OS Keychain via Electron
    const isAvailable = await ipcRenderer.invoke("safeStorage:isAvailable");
    if (isAvailable) {
      const encrypted = await ipcRenderer.invoke("safeStorage:encrypt", plainText);
      if (encrypted) return `os_keychain|${encrypted}`; // Prefix so we know how to decrypt
    }
  }

  // Fallback to crypto-js
  if (!masterKey) throw new Error("Master key required for browser fallback encryption.");
  return `crypto_js|${CryptoJS.AES.encrypt(plainText, masterKey).toString()}`;
};

/**
 * Decrypts data, dynamically switching between OS Keychain and crypto-js based
 * on the prefix attached during encryption.
 */
export const decryptData = async (encryptedString: string, masterKey?: string): Promise<string> => {
  if (!encryptedString) return "";

  const parts = encryptedString.split("|");
  const method = parts.length > 1 ? parts[0] : "plain"; // Backwards compatibility for plain text
  const data = parts.length > 1 ? parts.slice(1).join("|") : encryptedString;

  if (method === "plain") {
    return data; // Old unencrypted data
  }

  if (method === "os_keychain") {
    const ipcRenderer = getIpcRenderer();
    if (!ipcRenderer) {
        console.warn("OS Keychain data found but Electron IPC is not available. Retaining encrypted format.");
        return encryptedString; // Return the raw encrypted string if we can't decrypt it so we don't lose it
    }
    
    const isAvailable = await ipcRenderer.invoke("safeStorage:isAvailable");
    if (!isAvailable) {
        console.warn("OS Keychain encryption is not available on this system.");
        return encryptedString;
    }
    
    const decrypted = await ipcRenderer.invoke("safeStorage:decrypt", data);
    return decrypted || "";
  }

  if (method === "crypto_js") {
    if (!masterKey) throw new Error("Master key required to decrypt browser fallback data.");
    try {
        const bytes = CryptoJS.AES.decrypt(data, masterKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch(e) {
        console.error("CryptoJS Decryption failed", e);
        return ""; // Or handle error
    }
  }

  return data;
};
