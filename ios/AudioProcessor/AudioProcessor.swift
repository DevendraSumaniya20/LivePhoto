//
//  AudioProcessor.swift
//  LivePhoto
//
//  Created by BIRAJTECH on 26/08/25.
//

import Foundation
import AVFoundation

@objc(AudioProcessor)
class AudioProcessor: NSObject {
  
  @objc(cleanAudio:outputPath:resolver:rejecter:)
  func cleanAudio(inputPath: String,
                  outputPath: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock) {
    
    // Validate input path
    guard !inputPath.isEmpty else {
      rejecter("invalid_input", "Input path is empty", nil)
      return
    }
    
    guard !outputPath.isEmpty else {
      rejecter("invalid_output", "Output path is empty", nil)
      return
    }
    
    let inputURL = URL(fileURLWithPath: inputPath)
    let outputURL = URL(fileURLWithPath: outputPath)
    
    // Check if input file exists
    guard FileManager.default.fileExists(atPath: inputPath) else {
      rejecter("file_not_found", "Input audio file not found at path: \(inputPath)", nil)
      return
    }
    
    // Call the internal Swift helper
    processAndCleanAudio(input: inputURL, output: outputURL) { success, error in
      if success {
        resolver(outputPath)
      } else {
        rejecter("AUDIO_PROCESSING_ERROR", error?.localizedDescription ?? "Unknown error", error)
      }
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

// MARK: - Internal helper function
private func processAndCleanAudio(input: URL,
                                  output: URL,
                                  completion: @escaping (Bool, Error?) -> Void) {
  
  // Remove existing output file if it exists
  if FileManager.default.fileExists(atPath: output.path) {
    do {
      try FileManager.default.removeItem(at: output)
    } catch {
      completion(false, error)
      return
    }
  }
  
  let asset = AVAsset(url: input)
  
  // Check if audio track exists
  let audioTracks = asset.tracks(withMediaType: .audio)
  guard !audioTracks.isEmpty else {
    let error = NSError(domain: "AudioProcessor", code: 1, userInfo: [NSLocalizedDescriptionKey: "No audio track found"])
    completion(false, error)
    return
  }
  
  // Create export session for audio processing/cleaning
  guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
    let error = NSError(domain: "AudioProcessor", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create export session"])
    completion(false, error)
    return
  }
  
  exportSession.outputURL = output
  exportSession.outputFileType = .m4a
  exportSession.shouldOptimizeForNetworkUse = true
  
  // You can add audio processing effects here if needed
  // For now, this will just clean up the audio by re-encoding it
  
  exportSession.exportAsynchronously {
    switch exportSession.status {
    case .completed:
      completion(true, nil)
    case .failed:
      completion(false, exportSession.error)
    case .cancelled:
      let error = NSError(domain: "AudioProcessor", code: 3, userInfo: [NSLocalizedDescriptionKey: "Export was cancelled"])
      completion(false, error)
    default:
      let error = NSError(domain: "AudioProcessor", code: 4, userInfo: [NSLocalizedDescriptionKey: "Unknown export status"])
      completion(false, error)
    }
  }
}
