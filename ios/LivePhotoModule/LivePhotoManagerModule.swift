import Foundation
import Photos
import PhotosUI
import React
import UIKit

@objc(LivePhotoManager)
class LivePhotoManager: NSObject, PHPickerViewControllerDelegate {

    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?

    // MARK: - Pick Live Photo
    @objc
    func pickLivePhoto(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject

        var config = PHPickerConfiguration()
        config.filter = .livePhotos
        config.selectionLimit = 1

        let picker = PHPickerViewController(configuration: config)
        picker.delegate = self

        DispatchQueue.main.async {
            // Modern way to get key window
            if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootVC = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController {
                rootVC.present(picker, animated: true, completion: nil)
            } else {
                reject("NO_ROOT_VC", "Could not find root view controller", nil)
            }
        }
    }

    // MARK: - PHPicker Delegate
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)

        guard let item = results.first else {
            reject?("NO_SELECTION", "User did not select any Live Photo", nil)
            return
        }

        guard let assetId = item.assetIdentifier else {
            reject?("NO_ASSET_ID", "Could not get asset identifier", nil)
            return
        }

        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
        if let asset = fetchResult.firstObject {
            resolve?([
                "localIdentifier": asset.localIdentifier,
                "mediaType": asset.mediaType.rawValue,
                "creationDate": asset.creationDate?.timeIntervalSince1970 ?? 0
            ])
        } else {
            reject?("ASSET_NOT_FOUND", "PHAsset not found", nil)
        }
    }

    // MARK: - Check Device Compatibility
    @objc
    func checkDeviceCompatibility(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        if #available(iOS 14, *) {
            resolve([
                "isSupported": true,
                "message": "Device supports Live Photos",
                "deviceInfo": UIDevice.current.model
            ])
        } else {
            resolve([
                "isSupported": false,
                "message": "iOS version too low. Requires iOS 14+",
                "deviceInfo": UIDevice.current.model
            ])
        }
    }

    // Required for React Native
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
