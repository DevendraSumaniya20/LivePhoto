// utils/formatters.ts

// Format file size in human-readable form
const formatFileSize = (bytes: number, short: boolean = false): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const shortSizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${short ? shortSizes[i] : sizes[i]}`;
};

// Format date in relative/absolute style
const formatDate = (timestamp: string | number): string => {
  const date = new Date(Number(timestamp));
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

// Format duration from milliseconds
const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;

  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

// Format seconds to mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format resolution and calculate megapixels
const formatResolution = (width?: number, height?: number): string => {
  if (!width || !height) return 'Unknown';
  const megapixels = (width * height) / 1_000_000;
  return megapixels >= 1
    ? `${width} × ${height}\n(${megapixels.toFixed(1)}MP)`
    : `${width} × ${height}`;
};

// Map MIME type to readable format
const formatMimeType = (mime?: string): string => {
  if (!mime) return 'Unknown';

  const mimeMap: { [key: string]: string } = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'image/bmp': 'BMP Image',
    'image/tiff': 'TIFF Image',
    'video/mp4': 'MP4 Video',
    'video/mov': 'MOV Video',
    'video/avi': 'AVI Video',
    'video/3gpp': '3GP Video',
    'video/quicktime': 'QuickTime Video',
  };

  return (
    mimeMap[mime.toLowerCase()] ||
    mime.split('/')[1]?.toUpperCase() ||
    'Unknown'
  );
};

// Format crop rectangle
const formatCropRect = (rect: {
  width: number;
  height: number;
  x: number;
  y: number;
}): string =>
  `Size: ${rect.width} × ${rect.height}\nPosition: (${rect.x}, ${rect.y})`;

// Map EXIF keys to human-readable
const formatExifKey = (key: string): string => {
  const keyMap: { [key: string]: string } = {
    Make: 'Camera Make',
    Model: 'Camera Model',
    DateTime: 'Date Taken',
    ExposureTime: 'Shutter Speed',
    FNumber: 'Aperture',
    ISO: 'ISO Speed',
    FocalLength: 'Focal Length',
    Flash: 'Flash',
    WhiteBalance: 'White Balance',
    ExposureMode: 'Exposure Mode',
    SceneCaptureType: 'Scene Type',
    GPSLatitude: 'Latitude',
    GPSLongitude: 'Longitude',
    GPSAltitude: 'Altitude',
    Orientation: 'Orientation',
    XResolution: 'X Resolution',
    YResolution: 'Y Resolution',
    ResolutionUnit: 'Resolution Unit',
    Software: 'Software',
    ColorSpace: 'Color Space',
    ExifVersion: 'EXIF Version',
  };
  return keyMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
};

// Format EXIF value based on key
const formatExifValue = (key: string, value: any): string => {
  if (value == null) return 'N/A';

  switch (key) {
    case 'ExposureTime':
      return typeof value === 'number'
        ? value < 1
          ? `1/${Math.round(1 / value)} sec`
          : `${value} sec`
        : String(value);
    case 'FNumber':
      return `f/${value}`;
    case 'FocalLength':
      return `${value}mm`;
    case 'ISO':
      return `ISO ${value}`;
    case 'Flash':
      return (
        {
          '0': 'No Flash',
          '1': 'Flash Fired',
          '16': 'No Flash',
          '24': 'Flash Fired (Auto)',
          '25': 'Flash Fired (Auto, Return Light)',
        }[String(value)] || `Flash Mode ${value}`
      );
    case 'WhiteBalance':
      return value === '0' ? 'Auto' : value === '1' ? 'Manual' : String(value);
    case 'Orientation':
      return (
        {
          '1': 'Normal',
          '2': 'Flip Horizontal',
          '3': 'Rotate 180°',
          '4': 'Flip Vertical',
          '5': 'Rotate 90° CW + Flip',
          '6': 'Rotate 90° CW',
          '7': 'Rotate 90° CCW + Flip',
          '8': 'Rotate 90° CCW',
        }[String(value)] || `Orientation ${value}`
      );
    case 'DateTime':
    case 'DateTimeOriginal':
    case 'DateTimeDigitized':
      try {
        return formatDate(new Date(String(value)).getTime());
      } catch {
        return String(value);
      }
    case 'GPSLatitude':
    case 'GPSLongitude':
      if (typeof value === 'number')
        return `${Math.abs(value).toFixed(6)}°${
          value >= 0
            ? key.includes('Latitude')
              ? 'N'
              : 'E'
            : key.includes('Latitude')
            ? 'S'
            : 'W'
        }`;
      return String(value);
    case 'GPSAltitude':
      return `${value}m`;
    case 'XResolution':
    case 'YResolution':
      return `${value} dpi`;
    default:
      return typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value);
  }
};

export {
  formatFileSize,
  formatDate,
  formatDuration,
  formatTime,
  formatResolution,
  formatMimeType,
  formatCropRect,
  formatExifKey,
  formatExifValue,
};
