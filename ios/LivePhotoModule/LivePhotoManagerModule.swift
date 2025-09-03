import Foundation
import Photos
import PhotosUI
import UIKit

@objc(LivePhotoManager)
class LivePhotoManager: NSObject, PHPickerViewControllerDelegate {

    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    
    @objc(checkDeviceCompatibility:withRejecter:)
    func checkDeviceCompatibility(_ resolve: RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        let isSupported = PHLivePhotoView.livePhotoBadgeImage(options: .overContent) != nil
        NSLog("✅ Live Photo support check: \(isSupported)")
        resolve(isSupported)
    }

    @objc(pickLivePhoto:withRejecter:)
    func pickLivePhoto(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        NSLog("📸 pickLivePhoto called")
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
            
            NSLog("📂 Presenting PHPickerViewController")
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
        
        if let assetId = result.assetIdentifier {
            NSLog("📌 Got assetIdentifier: \(assetId)")
            let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
            if let asset = fetchResult.firstObject {
                NSLog("📊 Asset metadata -> width: \(asset.pixelWidth), height: \(asset.pixelHeight), duration: \(asset.duration), favorite: \(asset.isFavorite), subtype: \(asset.mediaSubtypes.rawValue)")
                NSLog("📅 Creation: \(String(describing: asset.creationDate)), Modification: \(String(describing: asset.modificationDate))")
                if let loc = asset.location {
                    NSLog("📍 Location lat: \(loc.coordinate.latitude), lon: \(loc.coordinate.longitude), alt: \(loc.altitude)")
                }

                if result.itemProvider.canLoadObject(ofClass: PHLivePhoto.self) {
                    result.itemProvider.loadObject(ofClass: PHLivePhoto.self) { livePhotoObj, error in
                        if let error = error {
                            NSLog("❌ Could not load Live Photo: \(error.localizedDescription)")
                            self.reject?("LOAD_ERROR", "Could not load Live Photo", error)
                        } else if let livePhoto = livePhotoObj as? PHLivePhoto {
                            NSLog("✅ Live Photo loaded successfully")
                            self.exportLivePhoto(livePhoto: livePhoto, asset: asset)
                        }
                    }
                } else {
                    NSLog("❌ Item provider cannot load PHLivePhoto")
                }
            } else {
                NSLog("❌ Failed to fetch PHAsset for identifier: \(assetId)")
                self.reject?("ASSET_ERROR", "Failed to fetch PHAsset", nil)
            }
        } else {
            NSLog("❌ Could not resolve asset identifier")
            self.reject?("NO_ASSET_ID", "Could not resolve asset identifier", nil)
        }
    }
    
    private func exportLivePhoto(livePhoto: PHLivePhoto, asset: PHAsset) {
        NSLog("🚀 Exporting Live Photo resources")
        let resources = PHAssetResource.assetResources(for: livePhoto)
        var videoURL: URL?
        var imageURL: URL?
        var photoFilename: String?
        var videoFilename: String?
        var photoMime: String?
        var videoMime: String?

        for res in resources {
            NSLog("🔎 Resource found -> type: \(res.type.rawValue), filename: \(res.originalFilename), uti: \(res.uniformTypeIdentifier)")
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
                    NSLog("🎥 Exported video resource -> \(fileURL)")
                } else if res.type == .photo {
                    imageURL = fileURL
                    photoFilename = res.originalFilename
                    photoMime = res.uniformTypeIdentifier
                    NSLog("🖼 Exported photo resource -> \(fileURL)")
                }
                
                if videoURL != nil && imageURL != nil {
                    NSLog("✅ Live Photo export complete, resolving with URLs")
                    let response: [String: Any] = [
                        "photo": imageURL!.absoluteString,
                        "video": videoURL!.absoluteString,
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
            }
        }
    }
}
