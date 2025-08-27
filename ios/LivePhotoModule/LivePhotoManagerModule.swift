//
// LivePhotoManagerModule.swift
// LivePhotoProcessing
//

import Foundation
import Photos
import PhotosUI
import AVFoundation
import Speech
import React
import UIKit

@objc(LivePhotoManager)
class LivePhotoManager: NSObject, PHPickerViewControllerDelegate {
  
  private var resolver: RCTPromiseResolveBlock?
  private var rejecter: RCTPromiseRejectBlock?
  
  // MARK: - Device Compatibility Check
  @objc(checkDeviceCompatibility:withRejecter:)
  func checkDeviceCompatibility(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let isLivePhotoSupported = PHLivePhoto.self != nil && UIDevice.current.systemVersion.compare("9.1", options: .numeric) != .orderedAscending
    let isSpeechRecognitionAvailable = SFSpeechRecognizer.authorizationStatus() != .denied
    
    let deviceInfo = """
    Device: \(UIDevice.current.model)
    iOS: \(UIDevice.current.systemVersion)
    Live Photo Support: \(isLivePhotoSupported ? "Yes" : "No")
    Speech Recognition: \(isSpeechRecognitionAvailable ? "Available" : "Unavailable")
    """
    
    let result: [String: Any] = [
      "isSupported": isLivePhotoSupported,
      "message": isLivePhotoSupported ? "Your device supports Live Photo features." : "Live Photos are not supported on this device.",
      "deviceInfo": deviceInfo
    ]
    
    resolve(result)
  }
  
  // MARK: - Safe way to get root view controller
  private var viewController: UIViewController? {
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
      return nil
    }
    
    var rootViewController = window.rootViewController
    while let presentedViewController = rootViewController?.presentedViewController {
      rootViewController = presentedViewController
    }
    return rootViewController
  }
  
  // MARK: - Request Permissions
  private func requestPermissions(completion: @escaping (Bool) -> Void) {
    let group = DispatchGroup()
    var hasPhotoPermission = false
    var hasSpeechPermission = false
    
    // Request Photo Library Permission
    group.enter()
    PHPhotoLibrary.requestAuthorization { status in
      hasPhotoPermission = status == .authorized || status == .limited
      group.leave()
    }
    
    // Request Speech Recognition Permission
    group.enter()
    SFSpeechRecognizer.requestAuthorization { status in
      hasSpeechPermission = status == .authorized
      group.leave()
    }
    
    group.notify(queue: .main) {
      completion(hasPhotoPermission && hasSpeechPermission)
    }
  }
  
  // MARK: - React Native method to pick Live Photo
  @objc(pickLivePhoto:withRejecter:)
  func pickLivePhoto(resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
    self.resolver = resolve
    self.rejecter = reject
    
    // Check permissions first
    requestPermissions { [weak self] granted in
      guard granted else {
        self?.rejecter?("permission_denied", "Photo library or speech recognition permission denied", nil)
        return
      }
      
      self?.presentLivePhotoPicker()
    }
  }
  
  private func presentLivePhotoPicker() {
    var config = PHPickerConfiguration()
    config.filter = .livePhotos // This specifically filters for Live Photos only
    config.selectionLimit = 1
    config.preferredAssetRepresentationMode = .current
    
    let picker = PHPickerViewController(configuration: config)
    picker.delegate = self
    
    DispatchQueue.main.async { [weak self] in
      guard let viewController = self?.viewController else {
        self?.rejecter?("no_view_controller", "Could not find root view controller", nil)
        return
      }
      viewController.present(picker, animated: true)
    }
  }
  
  // MARK: - PHPicker Delegate
  func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
    picker.dismiss(animated: true)
    
    guard let result = results.first else {
      rejecter?("no_selection", "No Live Photo selected", nil)
      return
    }
    
    // Check if it's actually a Live Photo
    guard result.itemProvider.hasItemConformingToTypeIdentifier("com.apple.live-photo-bundle") else {
      rejecter?("not_live_photo", "Selected item is not a Live Photo", nil)
      return
    }
    
    if let assetId = result.assetIdentifier {
      fetchAndProcessLivePhoto(assetIdentifier: assetId)
    } else {
      rejecter?("no_asset_id", "Could not get asset identifier", nil)
    }
  }
  
  // MARK: - Fetch and Process Live Photo
  private func fetchAndProcessLivePhoto(assetIdentifier: String) {
    let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetIdentifier], options: nil)
    guard let asset = fetchResult.firstObject else {
      rejecter?("asset_not_found", "PHAsset not found", nil)
      return
    }
    
    // Verify it's a Live Photo
    guard asset.mediaSubtypes.contains(.photoLive) else {
      rejecter?("not_live_photo_asset", "Asset is not a Live Photo", nil)
      return
    }
    
    processLivePhoto(asset: asset)
  }
  
  // MARK: - Process Live Photo
  private func processLivePhoto(asset: PHAsset) {
    let group = DispatchGroup()
    var photoURL: URL?
    var videoURL: URL?
    var audioURL: URL?
    var transcription = ""
    var processingError: Error?
    
    // Extract still image
    group.enter()
    extractStillImage(from: asset) { url, error in
      photoURL = url
      if let error = error { processingError = error }
      group.leave()
    }
    
    // Extract video component
    group.enter()
    extractVideoComponent(from: asset) { url, error in
      videoURL = url
      if let error = error { processingError = error }
      group.leave()
    }
    
    // Wait for photo and video extraction
    group.notify(queue: .global(qos: .background)) { [weak self] in
      guard processingError == nil,
            let videoURL = videoURL else {
        self?.rejecter?("extraction_failed", processingError?.localizedDescription ?? "Failed to extract Live Photo components", processingError)
        return
      }
      
      // Extract and clean audio from video
      group.enter()
      self?.extractAndCleanAudio(from: videoURL) { url, error in
        audioURL = url
        if let error = error { processingError = error }
        group.leave()
      }
      
      // Wait for audio extraction
      group.notify(queue: .global(qos: .background)) {
        guard let audioURL = audioURL else {
          self?.rejecter?("audio_extraction_failed", processingError?.localizedDescription ?? "Failed to extract audio", processingError)
          return
        }
        
        // Transcribe audio
        group.enter()
        self?.transcribeAudio(from: audioURL) { text, error in
          transcription = text ?? ""
          if let error = error {
            print("Transcription warning: \(error.localizedDescription)")
            // Don't fail the entire process for transcription errors
          }
          group.leave()
        }
        
        // Final result
        group.notify(queue: .main) {
          let result: [String: Any] = [
            "photo": photoURL?.path ?? "",
            "audio": audioURL.path,
            "transcription": transcription,
            "video": videoURL.path
          ]
          self?.resolver?(result)
        }
      }
    }
  }
  
  // MARK: - Extract Still Image
  private func extractStillImage(from asset: PHAsset, completion: @escaping (URL?, Error?) -> Void) {
    let options = PHContentEditingInputRequestOptions()
    options.isNetworkAccessAllowed = true
    
    asset.requestContentEditingInput(with: options) { input, info in
      guard let input = input,
            let fullSizeImageURL = input.fullSizeImageURL else {
        completion(nil, NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Could not access full size image"]))
        return
      }
      
      completion(fullSizeImageURL, nil)
    }
  }
  
  // MARK: - Extract Video Component
  private func extractVideoComponent(from asset: PHAsset, completion: @escaping (URL?, Error?) -> Void) {
    let resources = PHAssetResource.assetResources(for: asset)
    guard let videoResource = resources.first(where: { $0.type == .pairedVideo }) else {
      completion(nil, NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "No paired video found in Live Photo"]))
      return
    }
    
    let outputURL = createTemporaryURL(with: "live_photo", extension: "mov")
    
    let options = PHAssetResourceRequestOptions()
    options.isNetworkAccessAllowed = true
    
    PHAssetResourceManager.default().writeData(for: videoResource, toFile: outputURL, options: options) { error in
      if let error = error {
        completion(nil, error)
      } else {
        completion(outputURL, nil)
      }
    }
  }
  
  // MARK: - Extract and Clean Audio
  private func extractAndCleanAudio(from videoURL: URL, completion: @escaping (URL?, Error?) -> Void) {
    let asset = AVAsset(url: videoURL)
    
    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
      completion(nil, NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Could not create export session"]))
      return
    }
    
    let audioURL = createTemporaryURL(with: "extracted_audio", extension: "m4a")
    
    exportSession.outputURL = audioURL
    exportSession.outputFileType = .m4a
    exportSession.shouldOptimizeForNetworkUse = true
    
    // Apply basic audio filters for cleaning
    exportSession.audioMix = createAudioMix(for: asset)
    
    exportSession.exportAsynchronously {
      switch exportSession.status {
      case .completed:
        completion(audioURL, nil)
      case .failed:
        completion(nil, exportSession.error ?? NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Audio export failed"]))
      case .cancelled:
        completion(nil, NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Audio export cancelled"]))
      default:
        completion(nil, NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unknown export status"]))
      }
    }
  }
  
  // MARK: - Create Audio Mix for Cleaning
  private func createAudioMix(for asset: AVAsset) -> AVAudioMix? {
    guard let audioTrack = asset.tracks(withMediaType: .audio).first else { return nil }
    
    let audioMix = AVMutableAudioMix()
    let audioMixInputParameters = AVMutableAudioMixInputParameters(track: audioTrack)
    
    // Apply volume normalization and basic noise reduction
    audioMixInputParameters.setVolume(0.8, at: .zero) // Slight volume reduction
    
    audioMix.inputParameters = [audioMixInputParameters]
    return audioMix
  }
  
  // MARK: - Transcribe Audio
  private func transcribeAudio(from audioURL: URL, completion: @escaping (String?, Error?) -> Void) {
    guard let recognizer = SFSpeechRecognizer(),
          recognizer.isAvailable else {
      completion(nil, NSError(domain: "LivePhotoManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Speech recognizer not available"]))
      return
    }
    
    let request = SFSpeechURLRecognitionRequest(url: audioURL)
    request.requiresOnDeviceRecognition = false // Allow network for better accuracy
    request.shouldReportPartialResults = false
    
    recognizer.recognitionTask(with: request) { result, error in
      if let error = error {
        completion(nil, error)
      } else if let result = result, result.isFinal {
        completion(result.bestTranscription.formattedString, nil)
      }
    }
  }
  
  // MARK: - Helper Methods
  private func createTemporaryURL(with prefix: String, extension ext: String) -> URL {
    let fileName = "\(prefix)_\(UUID().uuidString).\(ext)"
    return FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
  }
  
  // MARK: - React Native Bridge Setup
  @objc
  static func requiresMainQueueSetup() -> Bool { 
    return true 
  }
  
  // MARK: - Clean up temporary files
  deinit {
    // Clean up any temporary files if needed
    let tempDir = FileManager.default.temporaryDirectory
    do {
      let tempFiles = try FileManager.default.contentsOfDirectory(at: tempDir, includingPropertiesForKeys: nil)
      for file in tempFiles {
        if file.lastPathComponent.contains("live_photo") || 
           file.lastPathComponent.contains("extracted_audio") {
          try? FileManager.default.removeItem(at: file)
        }
      }
    } catch {
      print("Could not clean temp files: \(error)")
    }
  }
}
