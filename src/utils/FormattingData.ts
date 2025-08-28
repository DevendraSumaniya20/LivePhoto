// Helper functions for formatting data
const formatFileSize = (bytes: number, short: boolean = false): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const shortSizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${short ? shortSizes[i] : sizes[i]}`;
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays === 2) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
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

const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatResolution = (width?: number, height?: number): string => {
  if (!width || !height) return 'Unknown';
  const megapixels = (width * height) / 1000000;
  if (megapixels >= 1) {
    return `${width} × ${height}\n(${megapixels.toFixed(1)}MP)`;
  }
  return `${width} × ${height}`;
};

// 👇 replace your old function with this one
const formatMimeType = (mime: string | undefined): string => {
  if (!mime) return 'Unknown'; // ✅ prevents crash if undefined

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

  const lowerMime = mime.toLowerCase();
  return mimeMap[lowerMime] || mime.split('/')[1]?.toUpperCase() || 'Unknown';
};

const formatCropRect = (cropRect: {
  width: number;
  height: number;
  x: number;
  y: number;
}): string => {
  return `Size: ${cropRect.width} × ${cropRect.height}\nPosition: (${cropRect.x}, ${cropRect.y})`;
};

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

const formatExifValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return 'N/A';

  switch (key) {
    case 'ExposureTime':
      if (typeof value === 'number') {
        return value < 1 ? `1/${Math.round(1 / value)} sec` : `${value} sec`;
      }
      return String(value);

    case 'FNumber':
      return `f/${value}`;

    case 'FocalLength':
      return `${value}mm`;

    case 'ISO':
      return `ISO ${value}`;

    case 'Flash':
      const flashModes: { [key: string]: string } = {
        '0': 'No Flash',
        '1': 'Flash Fired',
        '16': 'No Flash',
        '24': 'Flash Fired (Auto)',
        '25': 'Flash Fired (Auto, Return Light)',
      };
      return flashModes[String(value)] || `Flash Mode ${value}`;

    case 'WhiteBalance':
      return value === '0' ? 'Auto' : value === '1' ? 'Manual' : String(value);

    case 'Orientation':
      const orientations: { [key: string]: string } = {
        '1': 'Normal',
        '2': 'Flip Horizontal',
        '3': 'Rotate 180°',
        '4': 'Flip Vertical',
        '5': 'Rotate 90° CW + Flip',
        '6': 'Rotate 90° CW',
        '7': 'Rotate 90° CCW + Flip',
        '8': 'Rotate 90° CCW',
      };
      return orientations[String(value)] || `Orientation ${value}`;

    case 'DateTime':
    case 'DateTimeOriginal':
    case 'DateTimeDigitized':
      if (typeof value === 'string') {
        try {
          const date = new Date(value.replace(/:/g, '-').replace(' ', 'T'));
          return formatDate(date.getTime());
        } catch {
          return value;
        }
      }
      return String(value);

    case 'GPSLatitude':
    case 'GPSLongitude':
      if (typeof value === 'number') {
        return `${Math.abs(value).toFixed(6)}°${
          value >= 0
            ? key.includes('Latitude')
              ? 'N'
              : 'E'
            : key.includes('Latitude')
            ? 'S'
            : 'W'
        }`;
      }
      return String(value);

    case 'GPSAltitude':
      return `${value}m`;

    case 'XResolution':
    case 'YResolution':
      return `${value} dpi`;

    default:
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
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
