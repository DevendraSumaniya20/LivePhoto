package com.livephoto.audioextractor

import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.media.MediaMetadataRetriever
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Arguments
import java.io.File
import java.io.IOException
import java.nio.ByteBuffer

class AudioExtractorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AudioExtractor"
    }

    @ReactMethod
    fun extractAudio(videoPath: String, promise: Promise) {
        val downloadsDir = reactApplicationContext.getExternalFilesDir(null)?.absolutePath
            ?: android.os.Environment.getExternalStoragePublicDirectory(
                android.os.Environment.DIRECTORY_MUSIC
            ).absolutePath

        val outputPath = "$downloadsDir/extracted_${System.currentTimeMillis()}.m4a"
        val extractor = MediaExtractor()

        try {
            extractor.setDataSource(videoPath)

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

            if (audioTrackIndex == -1) {
                extractor.release()
                promise.reject("no_audio", "No audio track found in video")
                return
            }

            val muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            val dstIndex = muxer.addTrack(extractor.getTrackFormat(audioTrackIndex))
            muxer.start()

            val buffer = ByteBuffer.allocate(1 * 1024 * 1024) // 1 MB buffer
            val info = android.media.MediaCodec.BufferInfo()

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

            muxer.stop()
            muxer.release()
            extractor.release()

            // ✅ Build result map
            val file = File(outputPath)
            val result = Arguments.createMap()
            result.putString("path", outputPath)
            result.putDouble("size", file.length().toDouble())

            // ✅ Duration (via MediaMetadataRetriever)
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(outputPath)
            val durationMs = retriever.extractMetadata(
                MediaMetadataRetriever.METADATA_KEY_DURATION
            )?.toLongOrNull() ?: 0
            retriever.release()

            result.putDouble("duration", durationMs.toDouble() / 1000.0)

            promise.resolve(result)

        } catch (e: IOException) {
            extractor.release()
            promise.reject("extract_error", e)
        } catch (e: Exception) {
            extractor.release()
            promise.reject("extract_error", e)
        }
    }
}
