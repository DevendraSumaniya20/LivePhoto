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
        guard !asset.tracks(withMediaType: .audio).isEmpty else {
            NSLog("❌ [extractCleanAudio] No audio track in video")
            reject("no_audio", "No audio track in video", nil)
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
                let response: [String: Any] = [
                    "path": outputPath
                ]
                resolve(response)

            case .failed:
                NSLog("❌ [extractCleanAudio] Export failed: \(String(describing: exportSession.error))")
                reject("export_failed", exportSession.error?.localizedDescription ?? "Unknown error", exportSession.error)
            case .cancelled:
                NSLog("⚠️ [extractCleanAudio] Export cancelled")
                reject("export_cancelled", "Export cancelled", nil)
              
            default:
                NSLog("❓ [extractCleanAudio] Unknown export status")
                reject("export_unknown", "Unknown status", nil)
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
