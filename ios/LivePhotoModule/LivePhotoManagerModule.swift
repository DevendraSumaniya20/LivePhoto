import Foundation
import Photos
import PhotosUI
import UIKit
import Speech

@objc(LivePhotoManager)
class LivePhotoManager: NSObject, PHPickerViewControllerDelegate {

    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    private var enableTranscription: Bool = false
    
    // MARK: - Device Compatibility Check
    @objc(checkDeviceCompatibility:withRejecter:)
    func checkDeviceCompatibility(_ resolve: RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        let isSupported = PHLivePhotoView.livePhotoBadgeImage(options: .overContent) != nil
        NSLog("✅ Live Photo support check: \(isSupported)")
        resolve(isSupported)
    }

    // MARK: - Pick Live Photo without transcription
    @objc(pickLivePhoto:withRejecter:)
    func pickLivePhoto(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        self.enableTranscription = false
        presentPicker(resolve: resolve, reject: reject)
    }

    // MARK: - Pick Live Photo with transcription
    @objc(pickLivePhotoWithTranscription:withRejecter:)
    func pickLivePhotoWithTranscription(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        self.enableTranscription = true
        presentPicker(resolve: resolve, reject: reject)
    }
    
    // MARK: - Generic Picker
    private func presentPicker(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        NSLog("📸 Presenting PHPickerViewController")
        self.resolve = resolve
        self.reject = reject
        
        DispatchQueue.main.async {
            guard let rootVC = UIApplication.shared.keyWindow?.rootViewController else {
                NSLog("❌ Failed to get root view controller")
                reject("NO_VC", "Could not find root view controller", nil)
                return
            }
            
            var configuration = PHPickerConfiguration(photoLibrary: PHPhotoLibrary.shared())
            configuration.filter = .images
            configuration.selectionLimit = 1
            
            let picker = PHPickerViewController(configuration: configuration)
            picker.delegate = self
            rootVC.present(picker, animated: true, completion: nil)
        }
    }
    
    // MARK: - PHPicker Delegate
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        NSLog("➡️ picker didFinishPicking called with \(results.count) result(s)")
        picker.dismiss(animated: true, completion: nil)
        
        guard let result = results.first else {
            NSLog("❌ No item selected")
            self.reject?("NO_ITEM", "No item selected", nil)
            return
        }
        
        guard let assetId = result.assetIdentifier else {
            NSLog("❌ Could not resolve asset identifier")
            self.reject?("NO_ASSET_ID", "Could not resolve asset identifier", nil)
            return
        }
        
        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
        guard let asset = fetchResult.firstObject else {
            NSLog("❌ Failed to fetch PHAsset for identifier: \(assetId)")
            self.reject?("ASSET_ERROR", "Failed to fetch PHAsset", nil)
            return
        }
        
        if result.itemProvider.canLoadObject(ofClass: PHLivePhoto.self) {
            result.itemProvider.loadObject(ofClass: PHLivePhoto.self) { livePhotoObj, error in
                if let error = error {
                    NSLog("❌ Could not load Live Photo: \(error.localizedDescription)")
                    self.reject?("LOAD_ERROR", "Could not load Live Photo", error)
                } else if let livePhoto = livePhotoObj as? PHLivePhoto {
                    NSLog("✅ Live Photo loaded successfully")
                    if self.enableTranscription {
                        self.exportLivePhotoWithTranscription(livePhoto: livePhoto, asset: asset)
                    } else {
                        self.exportLivePhoto(livePhoto: livePhoto, asset: asset)
                    }
                }
            }
        } else {
            NSLog("❌ Item provider cannot load PHLivePhoto")
            self.reject?("LOAD_ERROR", "Item provider cannot load PHLivePhoto", nil)
        }
    }
    
    // MARK: - Export without transcription
    private func exportLivePhoto(livePhoto: PHLivePhoto, asset: PHAsset) {
        exportResources(livePhoto: livePhoto, asset: asset, includeTranscription: false)
    }
    
    // MARK: - Export with transcription
    private func exportLivePhotoWithTranscription(livePhoto: PHLivePhoto, asset: PHAsset) {
        exportResources(livePhoto: livePhoto, asset: asset, includeTranscription: true)
    }
    
    // MARK: - Generic Export
    private func exportResources(livePhoto: PHLivePhoto, asset: PHAsset, includeTranscription: Bool) {
        NSLog("🚀 Exporting Live Photo resources (transcription: \(includeTranscription))")
        let resources = PHAssetResource.assetResources(for: livePhoto)
        var videoURL: URL?
        var imageURL: URL?
        var photoFilename: String?
        var videoFilename: String?
        var photoMime: String?
        var videoMime: String?

        for res in resources {
            let fileName = NSTemporaryDirectory() + res.originalFilename
            let fileURL = URL(fileURLWithPath: fileName)
            try? FileManager.default.removeItem(at: fileURL)
            
            PHAssetResourceManager.default().writeData(for: res, toFile: fileURL, options: nil) { error in
                if let error = error {
                    NSLog("❌ Error exporting resource: \(error.localizedDescription)")
                    self.reject?("EXPORT_ERROR", "Error exporting Live Photo: \(error.localizedDescription)", error)
                    return
                }
                
                if res.type == .pairedVideo {
                    videoURL = fileURL
                    videoFilename = res.originalFilename
                    videoMime = res.uniformTypeIdentifier
                } else if res.type == .photo {
                    imageURL = fileURL
                    photoFilename = res.originalFilename
                    photoMime = res.uniformTypeIdentifier
                }
                
                if videoURL != nil && imageURL != nil {
                    if includeTranscription, let videoURL = videoURL {
                        self.transcribeVideoIfPossible(videoURL: videoURL) { transcription in
                            self.resolveFinalResponse(asset: asset, photoURL: imageURL!, videoURL: videoURL, photoFilename: photoFilename, videoFilename: videoFilename, photoMime: photoMime, videoMime: videoMime, transcription: transcription)
                        }
                    } else {
                        self.resolveFinalResponse(asset: asset, photoURL: imageURL!, videoURL: videoURL!, photoFilename: photoFilename, videoFilename: videoFilename, photoMime: photoMime, videoMime: videoMime, transcription: nil)
                    }
                }
            }
        }
    }
    
    // MARK: - Final Response
    private func resolveFinalResponse(asset: PHAsset, photoURL: URL, videoURL: URL, photoFilename: String?, videoFilename: String?, photoMime: String?, videoMime: String?, transcription: String?) {
        let response: [String: Any] = [
            "photo": photoURL.absoluteString,
            "video": videoURL.absoluteString,
            "transcription": transcription ?? "Transcription not possible",
            "localIdentifier": asset.localIdentifier,
            "creationDate": asset.creationDate?.timeIntervalSince1970 ?? 0,
            "modificationDate": asset.modificationDate?.timeIntervalSince1970 ?? 0,
            "location": asset.location != nil ? [
                "latitude": asset.location!.coordinate.latitude,
                "longitude": asset.location!.coordinate.longitude,
                "altitude": asset.location!.altitude,
                "timestamp": asset.location!.timestamp.timeIntervalSince1970
            ] : NSNull(),
            "pixelWidth": asset.pixelWidth,
            "pixelHeight": asset.pixelHeight,
            "duration": asset.duration,
            "isFavorite": asset.isFavorite,
            "mediaSubtypes": asset.mediaSubtypes.rawValue,
            "filenamePhoto": photoFilename ?? "",
            "filenameVideo": videoFilename ?? "",
            "photoMime": photoMime ?? "",
            "videoMime": videoMime ?? ""
        ]
        NSLog("📦 Final Response -> \(response)")
        self.resolve?(response)
    }
    
    // MARK: - Transcription
    private func transcribeVideoIfPossible(videoURL: URL, completion: @escaping (String?) -> Void) {
        let recognizer = SFSpeechRecognizer()
        guard recognizer?.isAvailable ?? false else {
            completion(nil)
            return
        }
        
        let request = SFSpeechURLRecognitionRequest(url: videoURL)
        recognizer?.recognitionTask(with: request) { result, error in
            if let error = error {
                NSLog("❌ Transcription error: \(error.localizedDescription)")
                completion(nil)
            } else if let result = result, result.isFinal {
                completion(result.bestTranscription.formattedString)
            }
        }
    }
}
