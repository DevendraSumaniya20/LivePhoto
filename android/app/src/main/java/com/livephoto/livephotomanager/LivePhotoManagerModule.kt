package com.livephoto.livephotomanager

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.media.*
import android.media.ThumbnailUtils
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import android.util.Size
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.util.UUID
import java.util.concurrent.Executors

class LivePhotoManagerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pickLivePhotoResolver: Promise? = null
    private val executor = Executors.newSingleThreadExecutor()

    companion object {
        const val PICK_LIVE_PHOTO_REQUEST = 1001
        const val TAG = "LivePhotoManager"
        const val MIN_API_LEVEL = 21

        val MOTION_PHOTO_MANUFACTURERS = setOf("samsung", "google")
        val LIVE_PHOTO_MANUFACTURERS = setOf("huawei", "xiaomi", "oneplus", "oppo", "vivo")
        val ALL_SUPPORTED_MANUFACTURERS = MOTION_PHOTO_MANUFACTURERS + LIVE_PHOTO_MANUFACTURERS
        val UNSUPPORTED_DEVICES = setOf("generic", "sdk", "emulator")
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "LivePhotoManager"

    // Move checkCompatibility above usage
    private fun checkCompatibility(): DeviceCompatibility {
        val manufacturer = Build.MANUFACTURER.lowercase()
        val model = Build.MODEL.lowercase()
        val device = Build.DEVICE.lowercase()
        val apiLevel = Build.VERSION.SDK_INT
        val deviceInfo = "Device: $manufacturer $model (API $apiLevel)"

        if (apiLevel < MIN_API_LEVEL) return DeviceCompatibility(
            false,
            "Your Android version (API $apiLevel) is too old. Live Photo features require Android 5.0 (API 21) or higher.",
            deviceInfo
        )

        if (UNSUPPORTED_DEVICES.any { device.contains(it) || model.contains(it) }) {
            return DeviceCompatibility(
                false,
                "Live Photo features are not supported on emulators or generic devices.",
                deviceInfo
            )
        }

        return when {
            manufacturer.contains("samsung") && apiLevel >= 24 -> DeviceCompatibility(true, "Your Samsung device supports Motion Photos.", deviceInfo)
            manufacturer.contains("google") -> DeviceCompatibility(true, "Your Google Pixel device supports Motion Photos.", deviceInfo)
            manufacturer.contains("huawei") -> DeviceCompatibility(true, "Your Huawei device supports Live Photo features.", deviceInfo)
            ALL_SUPPORTED_MANUFACTURERS.any { manufacturer.contains(it) } -> DeviceCompatibility(true, "Your device may support Live Photo-like features.", deviceInfo)
            else -> DeviceCompatibility(false, "Live Photo features may not be fully supported on your device ($manufacturer $model).", deviceInfo)
        }
    }

    @ReactMethod
    fun checkDeviceCompatibility(promise: Promise) {
        try {
            val compatibility = this.checkCompatibility()
            val result = Arguments.createMap().apply {
                putBoolean("isSupported", compatibility.isSupported)
                putString("message", compatibility.message)
                putString("deviceInfo", compatibility.deviceInfo)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("compatibility_check_error", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun pickLivePhoto(promise: Promise) {
        val compatibility = this.checkCompatibility()
        if (!compatibility.isSupported) {
            promise.reject("device_not_supported", compatibility.message)
            return
        }

        val activity = reactApplicationContext.currentActivity ?: run {
            promise.reject("no_activity", "Current activity not found")
            return
        }

        this.pickLivePhotoResolver = promise
        val intent = createLivePhotoPickIntent()

        try {
            activity.startActivityForResult(intent, PICK_LIVE_PHOTO_REQUEST)
        } catch (e: Exception) {
            promise.reject("picker_error", "Failed to open Live Photo picker: ${e.message}")
        }
    }

    private fun createLivePhotoPickIntent(): Intent {
        val manufacturer = Build.MANUFACTURER.lowercase()
        return when {
            manufacturer.contains("samsung") -> Intent(Intent.ACTION_PICK).apply {
                setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*")
                putExtra("motion_photo", true)
                putExtra("samsung.android.gallery.select_motion_photo", true)
            }
            manufacturer.contains("google") -> Intent(Intent.ACTION_PICK).apply {
                setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*")
                putExtra("motion_photo", true)
                putExtra("com.google.android.apps.photos.MOTION_PHOTO", true)
            }
            manufacturer.contains("huawei") -> Intent(Intent.ACTION_PICK).apply {
                setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*")
                putExtra("live_photo", true)
                putExtra("huawei_live_photo", true)
            }
            else -> Intent(Intent.ACTION_PICK).apply {
                type = "image/*"
                putExtra("motion_photo", true)
                putExtra("live_photo", true)
                putExtra("xiaomi.live_photo", true)
                putExtra("oneplus.live_photo", true)
                putExtra("oppo.live_photo", true)
                putExtra("vivo.live_photo", true)
            }
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == PICK_LIVE_PHOTO_REQUEST) {
            if (resultCode == Activity.RESULT_OK && data?.data != null) {
                handleSelectedMedia(data.data!!)
            } else {
                pickLivePhotoResolver?.reject("cancelled", "Live Photo selection was cancelled or failed")
                pickLivePhotoResolver = null
            }
        }
    }

    override fun onNewIntent(intent: Intent) {}

    private fun handleSelectedMedia(mediaUri: Uri) {
        executor.execute {
            try {
                val uuid = UUID.randomUUID().toString()
                val tempDir = File(reactApplicationContext.cacheDir, "livephoto_$uuid")
                tempDir.mkdirs()

                val originalFile = File(tempDir, "original.jpg")
                val videoFile = File(tempDir, "extracted_video.mp4")
                val audioFile = File(tempDir, "extracted_audio.m4a")
                val thumbnailFile = File(tempDir, "thumbnail.jpg")

                copyUriToFile(mediaUri, originalFile)

                val hasMotionComponent = detectAndExtractMotionComponents(originalFile, videoFile, audioFile, thumbnailFile)

                if (!hasMotionComponent) {
                    pickLivePhotoResolver?.reject(
                        "no_motion_component",
                        "Selected media does not contain motion/video components."
                    )
                    return@execute
                }

                // Offline transcription placeholder (no API key). Returns empty string by default.
                val transcription = transcribeAudioOffline(audioFile)

                val result = Arguments.createMap().apply {
                    putString("photo", thumbnailFile.absolutePath)
                    putString("audio", audioFile.absolutePath)
                    putString("transcription", transcription)
                    putString("video", videoFile.absolutePath)
                }

                pickLivePhotoResolver?.resolve(result)

            } catch (e: Exception) {
                Log.e(TAG, "Error processing Live Photo", e)
                pickLivePhotoResolver?.reject("processing_error", e.localizedMessage, e)
            } finally {
                pickLivePhotoResolver = null
            }
        }
    }

    private fun copyUriToFile(uri: Uri, targetFile: File) {
        reactApplicationContext.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(targetFile).use { output ->
                input.copyTo(output)
            }
        }
    }

    private fun detectAndExtractMotionComponents(
        originalFile: File,
        videoFile: File,
        audioFile: File,
        thumbnailFile: File
    ): Boolean {
        return try {
            if (extractEmbeddedVideo(originalFile, videoFile)) {
                extractAudioFromVideo(videoFile, audioFile)
                generateThumbnailFromVideo(videoFile, thumbnailFile)
                true
            } else if (isVideoFile(originalFile)) {
                originalFile.copyTo(videoFile, overwrite = true)
                extractAudioFromVideo(videoFile, audioFile)
                generateThumbnailFromVideo(videoFile, thumbnailFile)
                true
            } else if (findCompanionVideoFile(originalFile, videoFile)) {
                extractAudioFromVideo(videoFile, audioFile)
                originalFile.copyTo(thumbnailFile, overwrite = true)
                true
            } else false
        } catch (e: Exception) {
            Log.e(TAG, "Error detecting motion components", e)
            false
        }
    }

    private fun extractEmbeddedVideo(imageFile: File, videoFile: File): Boolean {
        // Attempt Google/Pixel Motion Photo extraction by parsing XMP to find MicroVideoOffset
        return try {
            val bytes = imageFile.readBytes()
            val xmp = extractXmpXml(bytes) ?: return false
            val offset = parseMicroVideoOffset(xmp) ?: return false
            if (offset <= 0 || offset >= bytes.size) return false

            // Copy MP4 bytes from offset to end
            if (videoFile.exists()) videoFile.delete()
            videoFile.outputStream().use { out ->
                out.write(bytes, offset.toInt(), bytes.size - offset.toInt())
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun isVideoFile(file: File): Boolean {
        val name = file.name.lowercase()
        return name.endsWith(".mp4") || name.endsWith(".mov") || name.endsWith(".3gp") || name.endsWith(".mkv")
    }

    private fun extractAudioFromVideo(videoFile: File, outputAudio: File) {
        val extractor = MediaExtractor()
        var muxer: MediaMuxer? = null
        try {
            extractor.setDataSource(videoFile.absolutePath)
            var audioTrackIndex = -1
            for (i in 0 until extractor.trackCount) {
                val format = extractor.getTrackFormat(i)
                val mime = format.getString(MediaFormat.KEY_MIME)
                if (mime != null && mime.startsWith("audio/")) {
                    audioTrackIndex = i
                    extractor.selectTrack(i)
                    break
                }
            }
            if (audioTrackIndex == -1) throw RuntimeException("No audio track found")

            if (outputAudio.exists()) outputAudio.delete()
            muxer = MediaMuxer(outputAudio.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            val dstIndex = muxer.addTrack(extractor.getTrackFormat(audioTrackIndex))
            muxer.start()

            val buffer = ByteBuffer.allocate(1 * 1024 * 1024)
            val info = MediaCodec.BufferInfo()
            while (true) {
                val sampleSize = extractor.readSampleData(buffer, 0)
                if (sampleSize < 0) break
                info.offset = 0
                info.size = sampleSize
                info.flags = extractor.sampleFlags
                info.presentationTimeUs = extractor.sampleTime
                muxer.writeSampleData(dstIndex, buffer, info)
                extractor.advance()
            }
        } finally {
            try { muxer?.stop(); muxer?.release() } catch (_: Exception) {}
            extractor.release()
        }
    }

    private fun generateThumbnailFromVideo(videoFile: File, thumbnailFile: File) {
        try {
            val bitmap: Bitmap? = if (Build.VERSION.SDK_INT >= 29) {
                ThumbnailUtils.createVideoThumbnail(videoFile, Size(512, 512), null)
            } else {
                ThumbnailUtils.createVideoThumbnail(videoFile.absolutePath, MediaStore.Video.Thumbnails.MINI_KIND)
            }
            if (bitmap != null) {
                FileOutputStream(thumbnailFile).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out)
                }
            }
        } catch (_: Exception) { }
    }

    private fun findCompanionVideoFile(imageFile: File, videoFile: File): Boolean {
        val dir = imageFile.parentFile ?: return false
        val base = imageFile.nameWithoutExtension
        val candidates = listOf("$base.mp4", "$base.mov")
        for (name in candidates) {
            val candidate = File(dir, name)
            if (candidate.exists()) {
                candidate.copyTo(videoFile, overwrite = true)
                return true
            }
        }
        return false
    }

    // --- XMP helpers for Google Motion Photos ---
    private fun extractXmpXml(data: ByteArray): String? {
        // XMP is between <x:xmpmeta ...> and </x:xmpmeta>
        val xmlStart = "<x:xmpmeta".toByteArray()
        val xmlEnd = "</x:xmpmeta>".toByteArray()
        val start = indexOf(data, xmlStart, 0)
        if (start == -1) return null
        val end = indexOf(data, xmlEnd, start)
        if (end == -1) return null
        val endInclusive = end + xmlEnd.size
        return try {
            String(data.copyOfRange(start, endInclusive))
        } catch (_: Exception) { null }
    }

    private fun parseMicroVideoOffset(xmpXml: String): Long? {
        // Look for GCamera:MicroVideoOffset or Container:Item based offsets
        val regex = Regex("MicroVideoOffset\\s*" +
                "=\\s*\"(\\d+)\"|<GCamera:MicroVideoOffset>(\\d+)</GCamera:MicroVideoOffset>")
        val match = regex.find(xmpXml) ?: return null
        val value = match.groupValues.drop(1).firstOrNull { it.isNotEmpty() } ?: return null
        return value.toLongOrNull()
    }

    private fun indexOf(data: ByteArray, pattern: ByteArray, from: Int): Int {
        if (pattern.isEmpty()) return -1
        var i = from
        outer@ while (i <= data.size - pattern.size) {
            var j = 0
            while (j < pattern.size) {
                if (data[i + j] != pattern[j]) { i++; continue@outer }
                j++
            }
            return i
        }
        return -1
    }

    // Offline file-based transcription stub (no API key). Replace with on-device model if desired.
    private fun transcribeAudioOffline(audioFile: File): String {
        // No network, no API key. Return empty or integrate an on-device model later.
        return ""
    }
}

data class DeviceCompatibility(
    val isSupported: Boolean,
    val message: String,
    val deviceInfo: String
)
