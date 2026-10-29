const GAS_URL = "https://script.google.com/macros/s/AKfycbwPCLpMfm6zwFAYxXG7dRh9E0ApffkWDvYliJP3vMm56kLWWVg_Kpn57oJFC-JaC5jCEQ/exec";

// 1. Membuat folder di Google Drive
export const buatFolderDrive = async (folderName) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "createFolder", folderName })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.folderId;
  } catch (error) {
    console.error("Gagal buat folder:", error);
    throw error;
  }
};

// Helper mengubah file ke Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

// 2. Fungsi upload 1 per 1 (paling stabil untuk menembus limit 50MB GAS jika upload puluhan foto)
export const uploadToDrive = async (file, targetFolderId) => {
  try {
    const base64Data = await fileToBase64(file);

    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "upload",
        folderId: targetFolderId,
        fileName: file.name,
        mimeType: file.type,
        base64: base64Data
      })
    });

    const result = await response.json();
    if (result.success) {
      return result.fileId;
    } else {
      throw new Error(result.error || "Gagal mengunggah ke Google Drive");
    }
  } catch (error) {
    console.error(`Gagal upload file ${file.name}:`, error);
    throw error;
  }
};