import Foundation
import AVFoundation

@objc(AudioExtractor)
class AudioExtractor: NSObject {

  @objc(extractAudio:withResolver:withRejecter:)
  func extractAudio(videoPath: String,
                    resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
    
    // Validate input path
    guard !videoPath.isEmpty else {
      reject("invalid_path", "Video path is empty", nil)
      return
    }
    
    let url = URL(fileURLWithPath: videoPath)
    
    // Check if file exists
    guard FileManager.default.fileExists(atPath: videoPath) else {
      reject("file_not_found", "Video file not found at path: \(videoPath)", nil)
      return
    }
    
    let asset = AVAsset(url: url)

    // Check if audio track exists
    let audioTracks = asset.tracks(withMediaType: .audio)
    guard !audioTracks.isEmpty else {
      reject("no_audio", "No audio track found in the video", nil)
      return
    }

    // Create output file path in Documents directory
    let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
    let timestamp = Int(Date().timeIntervalSince1970)
    let outputFileName = "extracted_audio_\(timestamp).m4a"
    let outputPath = "\(documentsPath)/\(outputFileName)"
    let outputURL = URL(fileURLWithPath: outputPath)

    // Remove existing file if it exists
    if FileManager.default.fileExists(atPath: outputPath) {
      do {
        try FileManager.default.removeItem(at: outputURL)
      } catch {
        print("Warning: Could not remove existing file: \(error)")
      }
    }

    // Create export session
    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
      reject("export_session_failed", "Could not create AVAssetExportSession", nil)
      return
    }

    exportSession.outputURL = outputURL
    exportSession.outputFileType = .m4a
    
    // Only export audio
    exportSession.shouldOptimizeForNetworkUse = true
    
    // Start extraction
    exportSession.exportAsynchronously {
      DispatchQueue.main.async {
        switch exportSession.status {
        case .completed:
          // Verify the output file was created
          guard FileManager.default.fileExists(atPath: outputPath) else {
            reject("file_not_created", "Audio file was not created", nil)
            return
          }
          
          do {
            // Get file attributes
            let fileAttributes = try FileManager.default.attributesOfItem(atPath: outputPath)
            let fileSize = (fileAttributes[.size] as? NSNumber)?.doubleValue ?? 0
            
            // Get audio duration
            let outputAsset = AVAsset(url: outputURL)
            let duration = CMTimeGetSeconds(outputAsset.duration)
            
            // Get audio format info
            var sampleRate: Double = 44100 // Default
            var format = "m4a"
            
            if let audioTrack = outputAsset.tracks(withMediaType: .audio).first {
              if let formatDescription = audioTrack.formatDescriptions.first {
                let basicDescription = CMAudioFormatDescriptionGetStreamBasicDescription(formatDescription as! CMAudioFormatDescription)
                if let basicDesc = basicDescription {
                  sampleRate = basicDesc.pointee.mSampleRate
                }
              }
            }
            
            // Build result matching Android structure
            let result: [String: Any] = [
              "path": outputPath,
              "size": Int(fileSize),
              "duration": duration.isFinite ? duration : 0,
              "format": format,
              "sampleRate": Int(sampleRate)
            ]
            
            print("Audio extraction successful: \(result)")
            resolve(result)
            
          } catch {
            reject("file_info_error", "Could not read file information: \(error.localizedDescription)", error)
          }
          
        case .failed:
          let errorMessage = exportSession.error?.localizedDescription ?? "Unknown export error"
          print("Export failed: \(errorMessage)")
          reject("export_failed", "Audio extraction failed: \(errorMessage)", exportSession.error)
          
        case .cancelled:
          reject("export_cancelled", "Audio extraction was cancelled", nil)
          
        default:
          reject("export_unknown", "Unknown export status: \(exportSession.status.rawValue)", nil)
        }
      }
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}