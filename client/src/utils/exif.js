import exifr from "exifr";
import { orientationTypes } from "./consts";

function extractExposureTimeSeconds(exif) {
  if (!exif) return null;

  // 1️⃣ Preferred: ExposureTime (usually seconds already)
  if (exif.ExposureTime) {
    const val = exif.ExposureTime;

    if (typeof val === "number") {
      return Number(val);
    }

    // Handle rational string like "1/200"
    if (typeof val === "string" && val.includes("/")) {
      const [num, den] = val.split("/").map(Number);
      if (den) return num / den;
    }
  }

  // 2️⃣ Fallback: ShutterSpeedValue (APEX)
  // ExposureTime = 1 / (2 ^ ShutterSpeedValue)
  if (typeof exif.ShutterSpeedValue === "number") {
    return 1 / Math.pow(2, exif.ShutterSpeedValue);
  }

  return null;
}

function extractDimensions(exif) {
  if (!exif) return { width: null, height: null };

  const width =
    exif.ExifImageWidth ??
    exif.ImageWidth ??
    exif.width ??
    null;

  const height =
    exif.ExifImageHeight ??
    exif.ImageHeight ??
    exif.height ??
    null;


  return { width, height };
}

function isRotated(exif) {
  // exifr can return Orientation as a number OR a string depending on reviveValues
  const o = exif?.Orientation;
  const rotation = exif?.Rotation; // exifr sometimes provides this directly


  // Check Rotation property first (exifr convenience field, degrees)
  if (rotation === 90 || rotation === 270) return true;

  // Numeric orientation tag (standard EXIF)
  if (typeof o === 'number') return o >= 5 && o <= 8;

  // String orientation (exifr revived value)
  if (typeof o === 'string') {
    const lower = o.toLowerCase();
    return lower.includes('90') || lower.includes('270');
  }

  return false;
}

function deriveOrientation(exif, width, height) {
  if (!width || !height) return null;

  let logicalWidth = width;
  let logicalHeight = height;

  if (isRotated(exif)) {
    logicalWidth = height;
    logicalHeight = width;
  }

  if (logicalWidth === logicalHeight) return orientationTypes.SQUARE;
  return logicalWidth > logicalHeight ? orientationTypes.LANDSCAPE : orientationTypes.PORTRAIT;
}

function extractLocation(exif) {
  if (
    typeof exif?.latitude === "number" &&
    typeof exif?.longitude === "number"
  ) {
    return {
      lat: Number(exif.latitude),
      lng: Number(exif.longitude),
    };
  }

  return null;
}

export async function extractMeta(file) {
  let exif = null;
  let size = null;

  try {
    exif = await exifr.parse(file, {
      gps: true,
      xmp: true,
      exif: true,
      tiff: true,
      ifd0: true,
    });


    // size = await exifr.imageSize(file);
  } catch (e) {
    console.error("EXIF parse error:", e);
  }

  const { width, height } = extractDimensions(exif);
  const orientation = deriveOrientation(exif, width, height);
  const location = extractLocation(exif);

  return {
    // ===== EXIF / Capture Metadata =====
    taken_at:
      exif?.DateTimeOriginal ??
      exif?.CreateDate ??
      null,

    camera_make: exif?.Make ?? null,
    camera_model: exif?.Model ?? null,
    lens_model: exif?.LensModel ?? null,

    focal_length_mm: exif?.FocalLength
      ? Number(exif.FocalLength)
      : null,

    aperture: exif?.FNumber
      ? Number(exif.FNumber)
      : null,

    iso: exif?.ISO ?? null,

    exposure_time: extractExposureTimeSeconds(exif),

    // ===== Location =====
    latitude:
      exif?.latitude && exif?.longitude
        ? Number(exif.latitude)
        : null,

    longitude:
      exif?.latitude && exif?.longitude
        ? Number(exif.longitude)
        : null,

    location,

    // ===== Image Properties =====
    width,
    height,
    orientation,

    // analysis_status handled by DB default
  };
}
















// import exifr from "exifr";

// export async function extractMeta (file) {
//     let exif = null
//     let size = null

//     try {
//         exif = await exifr.parse(file, {
//           gps: true,
//           xmp: true,
//           exif: true,
//           tiff: true,
//           ifd0: true,
//         });
    
//         size = await exifr.imageSize(file);
//       } catch (e) {
        
//       }
    
//       return {
//         fileName: file.name,
//         mimeType: file.type,
//         fileSize: file.size,
//         lastModified: file.lastModified,
    
//         takenAt: exif?.DateTimeOriginal ?? exif?.CreateDate,
//         orientation: exif?.Orientation,
    
//         width: size?.width,
//         height: size?.height,
    
//         cameraMake: exif?.Make,
//         cameraModel: exif?.Model,
    
//         gps: exif?.latitude && exif?.longitude ? {
//               lat: exif.latitude,
//               lng: exif.longitude,
//             } : null,
//       }
// }


// export async function TEST (file) {
//     return await exifr.parse(file, { reviveValues: false })
// }

