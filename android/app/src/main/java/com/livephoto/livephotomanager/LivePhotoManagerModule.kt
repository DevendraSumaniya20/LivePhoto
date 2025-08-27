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

                // Live mic transcription
                val transcription = transcribeAudioFromMic()

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

    private fun extractEmbeddedVideo(imageFile: File, videoFile: File): Boolean { /* implementation same as before */ return false }
    private fun isVideoFile(file: File): Boolean { /* implementation same as before */ return false }
    private fun extractAudioFromVideo(videoFile: File, outputAudio: File) { /* same as before */ }
    private fun generateThumbnailFromVideo(videoFile: File, thumbnailFile: File) { /* same as before */ }
    private fun findCompanionVideoFile(imageFile: File, videoFile: File): Boolean { /* same as before */ return false }

    // Live mic transcription using SpeechRecognizer
    private fun transcribeAudioFromMic(): String {
        var transcription = ""
        val recognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
        val listener = object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onError(error: Int) { Log.e(TAG, "SpeechRecognizer error: $error") }
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                transcription = matches?.joinToString(" ") ?: ""
            }
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        }

        recognizer.setRecognitionListener(listener)

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactApplicationContext.packageName)
        }

        recognizer.startListening(intent)
        Thread.sleep(5000) // simple example: listen for 5 seconds
        recognizer.stopListening()
        recognizer.destroy()

        return transcription
    }
}

data class DeviceCompatibility(
    val isSupported: Boolean,
    val message: String,
    val deviceInfo: String
)
