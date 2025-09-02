import Foundation
import Photos
import PhotosUI
import UIKit

@objc(LivePhotoManager)
class LivePhotoManager: NSObject, PHPickerViewControllerDelegate {

    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    
    @objc(checkDeviceCompatibility:withRejecter:)
    func checkDeviceCompatibility(_ resolve: RCTPromiseResolveBlock, withRejecter reject: RCTPromiseRejectBlock) {
        let isSupported = PHLivePhotoView.livePhotoBadgeImage(options: .overContent) != nil
        NSLog("Live Photo support check: \(isSupported)")
        resolve(isSupported)
    }

    @objc(pickLivePhoto:withRejecter:)
    func pickLivePhoto(_ resolve: @escaping RCTPromiseResolveBlock, withRejecter reject: @escaping RCTPromiseRejectBlock) {
        NSLog("pickLivePhoto called")
        self.resolve = resolve
        self.reject = reject
        
        DispatchQueue.main.async {
            guard let rootVC = UIApplication.shared.keyWindow?.rootViewController else {
                NSLog("Failed to get root view controller")
                reject("NO_VC", "Could not find root view controller", nil)
                return
            }
            
            var configuration = PHPickerConfiguration(photoLibrary: PHPhotoLibrary.shared())
            configuration.filter = .images
            configuration.selectionLimit = 1
            
            let picker = PHPickerViewController(configuration: configuration)
            picker.delegate = self
            
            NSLog("Presenting PHPickerViewController")
            rootVC.present(picker, animated: true, completion: nil)
        }
    }
    
    // MARK: - PHPicker Delegate
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        NSLog("picker didFinishPicking called with \(results.count) result(s)")
        picker.dismiss(animated: true, completion: nil)
        guard let itemProvider = results.first?.itemProvider else {
            NSLog("No item provider found")
            return
        }
        
        if itemProvider.canLoadObject(ofClass: PHLivePhoto.self) {
            NSLog("Item provider can load PHLivePhoto")
            itemProvider.loadObject(ofClass: PHLivePhoto.self) { livePhotoObj, error in
                if let error = error {
                    NSLog("Error loading Live Photo: \(error.localizedDescription)")
                    self.reject?("LOAD_ERROR", "Could not load Live Photo: \(error.localizedDescription)", error)
                } else if let livePhoto = livePhotoObj as? PHLivePhoto {
                    NSLog("Live Photo loaded successfully")
                    self.exportLivePhoto(livePhoto: livePhoto)
                }
            }
        } else {
            NSLog("Selected item is not a Live Photo")
            self.reject?("INVALID_TYPE", "Selected item is not a Live Photo", nil)
        }
    }
    
    private func exportLivePhoto(livePhoto: PHLivePhoto) {
        NSLog("Exporting Live Photo resources")
        let resources = PHAssetResource.assetResources(for: livePhoto)
        var videoURL: URL?
        var imageURL: URL?

        for res in resources {
            let fileName = NSTemporaryDirectory() + res.originalFilename
            let fileURL = URL(fileURLWithPath: fileName)
            try? FileManager.default.removeItem(at: fileURL)
            
            PHAssetResourceManager.default().writeData(for: res, toFile: fileURL, options: nil) { error in
                if let error = error {
                    NSLog("Error exporting resource \(res.originalFilename): \(error.localizedDescription)")
                    self.reject?("EXPORT_ERROR", "Error exporting Live Photo: \(error.localizedDescription)", error)
                    return
                }
                
                NSLog("Resource exported: \(res.originalFilename) to \(fileURL.path)")
                
                if res.type == .pairedVideo {
                    videoURL = fileURL
                } else if res.type == .photo {
                    imageURL = fileURL
                }
                
                if videoURL != nil && imageURL != nil {
                    NSLog("Live Photo export complete, resolving with URLs")
                    self.resolve?(["image": imageURL!.absoluteString, "video": videoURL!.absoluteString])
                }
            }
        }
    }
}
