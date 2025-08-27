//
//  AudioModule.swift
//  LivePhoto
//
//  Created by BIRAJTECH on 27/08/25.
//

import Foundation
import AVFoundation
import React

@objc(AudioModule)
class AudioModule: NSObject {
  
  // MARK: - Extract audio from video
  @objc(extractAudio:withResolver:withRejecter:)
  func extractAudio(
    videoPath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !videoPath.isEmpty else {
      reject("invalid_path", "Video path is empty", nil)
      return
    }
    guard FileManager.default.fileExists(atPath: videoPath) else {
      reject("file_not_found", "Video not found at: \(videoPath)", nil)
      return
    }
    
    let url = URL(fileURLWithPath: videoPath)
    let asset = AVAsset(url: url)
    guard !asset.tracks(withMediaType: .audio).isEmpty else {
      reject("no_audio", "No audio track in video", nil)
      return
    }
    
    let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
    let outputFileName = "extracted_audio_\(Int(Date().timeIntervalSince1970)).m4a"
    let outputPath = "\(documentsPath)/\(outputFileName)"
    let outputURL = URL(fileURLWithPath: outputPath)
    
    // Clean up old file
    if FileManager.default.fileExists(atPath: outputPath) {
      try? FileManager.default.removeItem(at: outputURL)
    }
    
    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
      reject("export_session_failed", "Could not create export session", nil)
      return
    }
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .m4a
    exportSession.shouldOptimizeForNetworkUse = true
    
    exportSession.exportAsynchronously {
      switch exportSession.status {
      case .completed:
        guard FileManager.default.fileExists(atPath: outputPath) else {
          reject("file_not_created", "Audio file not created", nil)
          return
        }
        do {
          let fileAttributes = try FileManager.default.attributesOfItem(atPath: outputPath)
          let fileSize = (fileAttributes[.size] as? NSNumber)?.doubleValue ?? 0
          let outputAsset = AVAsset(url: outputURL)
          let duration = CMTimeGetSeconds(outputAsset.duration)
          var sampleRate: Double = 44100
          
          if let audioTrack = outputAsset.tracks(withMediaType: .audio).first,
             let formatDescription = audioTrack.formatDescriptions.first {
            if let basicDescription = CMAudioFormatDescriptionGetStreamBasicDescription(formatDescription as! CMAudioFormatDescription) {
              sampleRate = basicDescription.pointee.mSampleRate
            }
          }
          
          resolve([
            "path": outputPath,
            "size": Int(fileSize),
            "duration": duration.isFinite ? duration : 0,
            "format": "m4a",
            "sampleRate": Int(sampleRate)
          ])
        } catch {
          reject("file_info_error", "Could not read file info", error)
        }
      case .failed:
        reject("export_failed", exportSession.error?.localizedDescription ?? "Unknown error", exportSession.error)
      case .cancelled:
        reject("export_cancelled", "Export cancelled", nil)
      default:
        reject("export_unknown", "Unknown status", nil)
      }
    }
  }
  
  // MARK: - Clean/Re-encode audio file
  @objc(cleanAudio:outputPath:resolver:rejecter:)
  func cleanAudio(inputPath: String,
                  outputPath: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock) {
    guard !inputPath.isEmpty else {
      rejecter("invalid_input", "Input path empty", nil)
      return
    }
    guard !outputPath.isEmpty else {
      rejecter("invalid_output", "Output path empty", nil)
      return
    }
    guard FileManager.default.fileExists(atPath: inputPath) else {
      rejecter("file_not_found", "No input file at \(inputPath)", nil)
      return
    }
    
    let inputURL = URL(fileURLWithPath: inputPath)
    let outputURL = URL(fileURLWithPath: outputPath)
    
    if FileManager.default.fileExists(atPath: outputPath) {
      try? FileManager.default.removeItem(at: outputURL)
    }
    
    let asset = AVAsset(url: inputURL)
    guard !asset.tracks(withMediaType: .audio).isEmpty else {
      rejecter("no_audio", "No audio track in file", nil)
      return
    }
    
    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
      rejecter("export_session_failed", "Could not create export session", nil)
      return
    }
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .m4a
    exportSession.shouldOptimizeForNetworkUse = true
    
    exportSession.exportAsynchronously {
      switch exportSession.status {
      case .completed:
        resolver(outputPath)
      case .failed:
        rejecter("export_failed", exportSession.error?.localizedDescription ?? "Unknown error", exportSession.error)
      case .cancelled:
        rejecter("export_cancelled", "Export cancelled", nil)
      default:
        rejecter("export_unknown", "Unknown status", nil)
      }
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
