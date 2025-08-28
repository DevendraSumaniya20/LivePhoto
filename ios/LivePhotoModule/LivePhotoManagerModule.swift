import Foundation
import Photos
import PhotosUI
import React
import UIKit
import AVFoundation

@objc(LivePhotoManager)
class LivePhotoManager: NSObject, PHPickerViewControllerDelegate {

    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?

    @objc(checkDeviceCompatibility:withRejecter:)
    func checkDeviceCompatibility(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        let isSupported = PHAsset.self != nil // Basic check for Photos framework
        resolve([
            "isSupported": isSupported,
            "platform": "iOS",
            "version": UIDevice.current.systemVersion
        ])
    }

    @objc(testMethod:withRejecter:)
    func testMethod(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(["status": "LivePhotoManager is working", "timestamp": Date().timeIntervalSince1970])
    }

    @objc(pickLivePhoto:withRejecter:)
    func pickLivePhoto(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject

        let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        if status == .authorized || status == .limited {
            DispatchQueue.main.async { self.presentPicker() }
        } else {
            PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
                DispatchQueue.main.async {
                    if status == .authorized || status == .limited {
                        self.presentPicker()
                    } else {
                        reject("PERMISSION_DENIED", "Photo library access denied", nil)
                        self.clearPromises()
                    }
                }
            }
        }
    }

    private func presentPicker() {
        var config = PHPickerConfiguration()
        config.filter = .livePhotos
        config.selectionLimit = 1
        config.preferredAssetRepresentationMode = .current

        let picker = PHPickerViewController(configuration: config)
        picker.delegate = self

        DispatchQueue.main.async {
            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootVC = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
                self.reject?("NO_ROOT_VC", "Could not find root view controller", nil)
                self.clearPromises()
                return
            }
            rootVC.present(picker, animated: true)
        }
    }

    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)

        guard let item = results.first, let assetId = item.assetIdentifier else {
            reject?("NO_SELECTION", "No Live Photo selected", nil)
            clearPromises()
            return
        }

        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
        guard let asset = fetchResult.firstObject else {
            reject?("ASSET_NOT_FOUND", "PHAsset not found", nil)
            clearPromises()
            return
        }

        // Verify it's actually a Live Photo
        guard asset.mediaSubtypes.contains(.photoLive) else {
            reject?("NOT_LIVE_PHOTO", "Selected media is not a Live Photo", nil)
            clearPromises()
            return
        }

        processLivePhoto(asset: asset)
    }

  private func processLivePhoto(asset: PHAsset) {
      let dispatchGroup = DispatchGroup()
      var stillImagePath: String?
      var videoPath: String?
      var audioPath: String?
      var transcription: String?
      var error: Error?

      // Extract still image
      dispatchGroup.enter()
      extractStillImage(from: asset) { path in
          stillImagePath = path
          dispatchGroup.leave()
      }

      // Extract video component
      dispatchGroup.enter()
      extractVideo(from: asset) { path in
          videoPath = path
          if let videoPath = path {
              // Extract audio from video
              self.extractAudioFromVideo(videoPath: videoPath) { extractedAudioPath, transcriptionText in
                  audioPath = extractedAudioPath
                  transcription = transcriptionText
              }
          }
          dispatchGroup.leave()
      }

      dispatchGroup.notify(queue: .main) {
          guard let stillPath = stillImagePath, let videoPath = videoPath else {
              self.reject?("EXTRACTION_FAILED", "Failed to extract Live Photo components", nil)
              self.clearPromises()
              return
          }

          let result: [String: Any] = [
              "photo": stillPath,
              "video": videoPath,
              "audio": audioPath ?? "",
              "transcription": transcription ?? "",
              "localIdentifier": asset.localIdentifier,
              "creationDate": asset.creationDate?.timeIntervalSince1970 ?? 0,
              "modificationDate": asset.modificationDate?.timeIntervalSince1970 ?? 0,
              "location": self.extractLocationData(from: asset),
              "duration": asset.duration,
              "pixelWidth": asset.pixelWidth,
              "pixelHeight": asset.pixelHeight
          ]

          self.resolve?(result)
          self.clearPromises()
      }
  }

    private func extractStillImage(from asset: PHAsset, completion: @escaping (String?) -> Void) {
        let options = PHImageRequestOptions()
        options.deliveryMode = .highQualityFormat
        options.isNetworkAccessAllowed = true
        options.isSynchronous = false

        PHImageManager.default().requestImage(for: asset, targetSize: PHImageManagerMaximumSize, contentMode: .aspectFit, options: options) { image, _ in
            guard let image = image else { 
                completion(nil)
                return 
            }
            
            DispatchQueue.global(qos: .userInitiated).async {
                let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let filename = "livephoto_\(asset.localIdentifier)_\(Date().timeIntervalSince1970)_image.jpg"
                let path = docs.appendingPathComponent(filename)
                
                if let data = image.jpegData(compressionQuality: 0.9) {
                    do {
                        try data.write(to: path)
                        completion(path.path)
                    } catch {
                        print("Error writing image: \(error)")
                        completion(nil)
                    }
                } else { 
                    completion(nil) 
                }
            }
        }
    }

    private func extractVideo(from asset: PHAsset, completion: @escaping (String?) -> Void) {
        let options = PHVideoRequestOptions()
        options.deliveryMode = .highQualityFormat
        options.isNetworkAccessAllowed = true

        PHImageManager.default().requestAVAsset(forVideo: asset, options: options) { avAsset, _, _ in
            guard let urlAsset = avAsset as? AVURLAsset else { 
                completion(nil)
                return 
            }
            
            DispatchQueue.global(qos: .userInitiated).async {
                let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let filename = "livephoto_\(asset.localIdentifier)_\(Date().timeIntervalSince1970)_video.mov"
                let path = docs.appendingPathComponent(filename)
                
                do {
                    try FileManager.default.copyItem(at: urlAsset.url, to: path)
                    completion(path.path)
                } catch {
                    print("Error copying video: \(error)")
                    completion(nil)
                }
            }
        }
    }

    private func extractAudioFromVideo(videoPath: String, completion: @escaping (String?, String?) -> Void) {
        let videoURL = URL(fileURLWithPath: videoPath)
        let asset = AVAsset(url: videoURL)
        
        guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
            completion(nil, nil)
            return
        }
        
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let audioFilename = videoPath.replacingOccurrences(of: ".mov", with: "_audio.m4a")
        let audioURL = docs.appendingPathComponent(URL(fileURLWithPath: audioFilename).lastPathComponent)
        
        // Remove existing file if it exists
        try? FileManager.default.removeItem(at: audioURL)
        
        exportSession.outputURL = audioURL
        exportSession.outputFileType = .m4a
        exportSession.exportAsynchronously {
            DispatchQueue.main.async {
                switch exportSession.status {
                case .completed:
                    // Here you could add speech recognition for transcription
                    completion(audioURL.path, nil)
                case .failed, .cancelled:
                    completion(nil, nil)
                default:
                    completion(nil, nil)
                }
            }
        }
    }

    private func extractLocationData(from asset: PHAsset) -> [String: Any] {
        guard let location = asset.location else { return [:] }
        
        return [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "altitude": location.altitude,
            "timestamp": location.timestamp.timeIntervalSince1970
        ]
    }

    private func clearPromises() {
        self.resolve = nil
        self.reject = nil
    }

    @objc
    static func requiresMainQueueSetup() -> Bool { 
        return true 
    }
}
