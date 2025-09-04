//
//  AudioModule.swift
//  LivePhoto
//
//  Created by BIRAJTECH on 27/08/25.
//

import Foundation
import AVFoundation
import React
import Speech

@objc(AudioModule)
class AudioModule: NSObject {

    // MARK: - Extract and Clean Audio from Video
    @objc(extractCleanAudio:withResolver:withRejecter:)
    func extractCleanAudio(
        videoPath: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        NSLog("🎬 [extractCleanAudio] Called with videoPath=\(videoPath)")

        guard !videoPath.isEmpty else {
            NSLog("❌ [extractCleanAudio] Video path empty")
            reject("invalid_path", "Video path is empty", nil)
            return
        }
        guard FileManager.default.fileExists(atPath: videoPath) else {
            NSLog("❌ [extractCleanAudio] File not found at \(videoPath)")
            reject("file_not_found", "Video not found at: \(videoPath)", nil)
            return
        }

        let url = URL(fileURLWithPath: videoPath)
        let asset = AVAsset(url: url)
        
        Task {
            do {
                // Check for audio tracks using new async API
                let audioTracks = try await asset.loadTracks(withMediaType: .audio)
                guard !audioTracks.isEmpty else {
                    NSLog("❌ [extractCleanAudio] No audio track in video")
                    await MainActor.run {
                        reject("no_audio", "No audio track in video", nil)
                    }
                    return
                }

                let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
                let outputFileName = "extracted_audio_\(Int(Date().timeIntervalSince1970)).m4a"
                let outputPath = "\(documentsPath)/\(outputFileName)"
                let outputURL = URL(fileURLWithPath: outputPath)

                if FileManager.default.fileExists(atPath: outputPath) {
                    NSLog("🧹 [extractCleanAudio] Removing old file at \(outputPath)")
                    try? FileManager.default.removeItem(at: outputURL)
                }

                await MainActor.run {
                    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
                        NSLog("❌ [extractCleanAudio] Could not create export session")
                        reject("export_session_failed", "Could not create export session", nil)
                        return
                    }

                    exportSession.outputURL = outputURL
                    exportSession.outputFileType = .m4a
                    exportSession.shouldOptimizeForNetworkUse = true

                    NSLog("📤 [extractCleanAudio] Starting export → \(outputPath)")

                    exportSession.exportAsynchronously {
                        switch exportSession.status {
                        case .completed:
                            NSLog("✅ [extractCleanAudio] Export completed")
                            guard FileManager.default.fileExists(atPath: outputPath) else {
                                NSLog("❌ [extractCleanAudio] File not created after export")
                                reject("file_not_created", "Audio file not created", nil)
                                return
                            }
                            
                            // Get file attributes and audio properties
                            do {
                                let attributes = try FileManager.default.attributesOfItem(atPath: outputPath)
                                let fileSize = attributes[.size] as? NSNumber ?? 0
                                
                                // Get audio duration and sample rate using new async API
                                let audioAsset = AVAsset(url: outputURL)
                                Task {
                                    do {
                                        let duration = try await audioAsset.load(.duration)
                                        let durationSeconds = CMTimeGetSeconds(duration)
                                        
                                        // Get sample rate from audio track using new async API
                                        var sampleRate: Float = 44100.0
                                        let audioTracks = try await audioAsset.loadTracks(withMediaType: .audio)
                                        if let audioTrack = audioTracks.first {
                                            let formatDescriptions = try await audioTrack.load(.formatDescriptions)
                                            if let formatDesc = formatDescriptions.first {
                                                let audioStreamBasicDescription = CMAudioFormatDescriptionGetStreamBasicDescription(formatDesc as! CMAudioFormatDescription)
                                                if let basicDesc = audioStreamBasicDescription {
                                                    sampleRate = Float(basicDesc.pointee.mSampleRate)
                                                }
                                            }
                                        }
                                        
                                        let response: [String: Any] = [
                                            "path": outputPath,
                                            "size": fileSize.intValue,
                                            "duration": durationSeconds.isNaN ? 0.0 : durationSeconds,
                                            "format": "m4a",
                                            "sampleRate": Int(sampleRate),
                                            "processed": true
                                        ]
                                        
                                        NSLog("📊 [extractCleanAudio] Audio info: size=\(fileSize), duration=\(durationSeconds), sampleRate=\(sampleRate)")
                                        await MainActor.run {
                                            resolve(response)
                                        }
                                    } catch {
                                        NSLog("⚠️ [extractCleanAudio] Could not load asset properties: \(error)")
                                        let response: [String: Any] = [
                                            "path": outputPath,
                                            "size": 0,
                                            "duration": 0.0,
                                            "format": "m4a",
                                            "sampleRate": 44100,
                                            "processed": true
                                        ]
                                        await MainActor.run {
                                            resolve(response)
                                        }
                                    }
                                }
                                
                            } catch {
                                NSLog("⚠️ [extractCleanAudio] Could not get file attributes: \(error)")
                                let response: [String: Any] = [
                                    "path": outputPath,
                                    "size": 0,
                                    "duration": 0.0,
                                    "format": "m4a",
                                    "sampleRate": 44100,
                                    "processed": true
                                ]
                                resolve(response)
                            }

                        case .failed:
                            NSLog("❌ [extractCleanAudio] Export failed: \(String(describing: exportSession.error))")
                            reject("export_failed", exportSession.error?.localizedDescription ?? "Unknown export error", exportSession.error)
                        case .cancelled:
                            NSLog("⚠️ [extractCleanAudio] Export cancelled")
                            reject("export_cancelled", "Audio extraction was cancelled", nil)
                          
                        default:
                            NSLog("❓ [extractCleanAudio] Unknown export status: \(exportSession.status)")
                            reject("export_unknown", "Unknown export status", nil)
                        }
                    }
                }
            } catch {
                NSLog("❌ [extractCleanAudio] Failed to load audio tracks: \(error)")
                await MainActor.run {
                    reject("load_tracks_failed", "Failed to load audio tracks", error)
                }
            }
        }
    }

    // MARK: - Create Silent Video (Remove Audio Track)
    @objc(createSilentVideo:withResolver:withRejecter:)
    func createSilentVideo(
        videoPath: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        NSLog("🔇 [createSilentVideo] Called with videoPath=\(videoPath)")

        guard !videoPath.isEmpty else {
            NSLog("❌ [createSilentVideo] Video path empty")
            reject("invalid_path", "Video path is empty", nil)
            return
        }
        guard FileManager.default.fileExists(atPath: videoPath) else {
            NSLog("❌ [createSilentVideo] File not found at \(videoPath)")
            reject("file_not_found", "Video not found at: \(videoPath)", nil)
            return
        }

        let url = URL(fileURLWithPath: videoPath)
        let asset = AVAsset(url: url)

        let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
        let outputFileName = "silent_video_\(Int(Date().timeIntervalSince1970)).mp4"
        let outputPath = "\(documentsPath)/\(outputFileName)"
        let outputURL = URL(fileURLWithPath: outputPath)

        if FileManager.default.fileExists(atPath: outputPath) {
            NSLog("🧹 [createSilentVideo] Removing old file at \(outputPath)")
            try? FileManager.default.removeItem(at: outputURL)
        }

        Task {
            do {
                // Create composition to exclude audio tracks
                let composition = AVMutableComposition()
                let videoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)
                
                // Load video tracks using new async API
                let videoTracks = try await asset.loadTracks(withMediaType: .video)
                guard let sourceVideoTrack = videoTracks.first else {
                    NSLog("❌ [createSilentVideo] No video track found")
                    await MainActor.run {
                        reject("no_video", "No video track found in source", nil)
                    }
                    return
                }

                // Load duration using new async API
                let assetDuration = try await asset.load(.duration)
                try videoTrack?.insertTimeRange(CMTimeRange(start: .zero, duration: assetDuration),
                                              of: sourceVideoTrack,
                                              at: .zero)

                await MainActor.run {
                    // Create export session with the composition
                    guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
                        NSLog("❌ [createSilentVideo] Could not create export session")
                        reject("export_session_failed", "Could not create export session", nil)
                        return
                    }

                    exportSession.outputURL = outputURL
                    exportSession.outputFileType = .mp4
                    exportSession.shouldOptimizeForNetworkUse = true

                    NSLog("📤 [createSilentVideo] Starting silent video export → \(outputPath)")

                    exportSession.exportAsynchronously {
                        switch exportSession.status {
                        case .completed:
                            NSLog("✅ [createSilentVideo] Export completed")
                            guard FileManager.default.fileExists(atPath: outputPath) else {
                                NSLog("❌ [createSilentVideo] File not created after export")
                                reject("file_not_created", "Silent video file not created", nil)
                                return
                            }
                            
                            do {
                                let attributes = try FileManager.default.attributesOfItem(atPath: outputPath)
                                let fileSize = attributes[.size] as? NSNumber ?? 0
                                
                                // Create new asset to get duration without capturing exportSession
                                let completedAsset = AVAsset(url: outputURL)
                                Task {
                                    do {
                                        let duration = try await completedAsset.load(.duration)
                                        let durationSeconds = CMTimeGetSeconds(duration)
                                        
                                        let response: [String: Any] = [
                                            "path": outputPath,
                                            "size": fileSize.intValue,
                                            "duration": durationSeconds.isNaN ? 0.0 : durationSeconds,
                                            "format": "mp4",
                                            "hasAudio": false
                                        ]
                                        
                                        NSLog("📊 [createSilentVideo] Silent video info: size=\(fileSize), duration=\(durationSeconds)")
                                        await MainActor.run {
                                            resolve(response)
                                        }
                                    } catch {
                                        NSLog("⚠️ [createSilentVideo] Could not load duration: \(error)")
                                        let response: [String: Any] = [
                                            "path": outputPath,
                                            "size": 0,
                                            "duration": 0.0,
                                            "format": "mp4",
                                            "hasAudio": false
                                        ]
                                        await MainActor.run {
                                            resolve(response)
                                        }
                                    }
                                }
                                
                            } catch {
                                NSLog("⚠️ [createSilentVideo] Could not get file attributes: \(error)")
                                let response: [String: Any] = [
                                    "path": outputPath,
                                    "size": 0,
                                    "duration": 0.0,
                                    "format": "mp4",
                                    "hasAudio": false
                                ]
                                resolve(response)
                            }

                        case .failed:
                            NSLog("❌ [createSilentVideo] Export failed: \(String(describing: exportSession.error))")
                            reject("export_failed", exportSession.error?.localizedDescription ?? "Unknown export error", exportSession.error)
                        case .cancelled:
                            NSLog("⚠️ [createSilentVideo] Export cancelled")
                            reject("export_cancelled", "Silent video creation was cancelled", nil)
                          
                        default:
                            NSLog("❓ [createSilentVideo] Unknown export status: \(exportSession.status)")
                            reject("export_unknown", "Unknown export status", nil)
                        }
                    }
                }
            } catch {
                NSLog("❌ [createSilentVideo] Failed to load tracks or duration: \(error)")
                await MainActor.run {
                    reject("load_error", "Failed to load video properties", error)
                }
            }
        }
    }

    // MARK: - Transcribe Audio File
    @objc(transcribeAudio:resolver:rejecter:)
    func transcribeAudio(audioPath: String,
                         resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {

        NSLog("📝 [transcribeAudio] Called with audioPath=%@", audioPath)

        guard FileManager.default.fileExists(atPath: audioPath) else {
            NSLog("❌ [transcribeAudio] File not found at %@", audioPath)
            resolver(nil)
            return
        }

        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")) else {
            NSLog("❌ [transcribeAudio] Could not create recognizer")
            resolver(nil)
            return
        }

        if !recognizer.isAvailable {
            NSLog("❌ [transcribeAudio] Speech recognizer unavailable")
            resolver(nil)
            return
        }

        let url = URL(fileURLWithPath: audioPath)
        let request = SFSpeechURLRecognitionRequest(url: url)
        request.requiresOnDeviceRecognition = true

        recognizer.recognitionTask(with: request) { result, error in
            if let error = error {
                NSLog("⚠️ [transcribeAudio] Recognition error: %@", error.localizedDescription)
                resolver(nil)
            } else if let result = result, result.isFinal {
                NSLog("✅ [transcribeAudio] Final transcription: %@", result.bestTranscription.formattedString)
                resolver(result.bestTranscription.formattedString)
            } else {
                resolver(nil)
            }
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
