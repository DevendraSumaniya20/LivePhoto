//
//  LivePhotoManager.m
//  LivePhoto
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LivePhotoManager, NSObject)

// ✅ Existing methods
RCT_EXTERN_METHOD(checkDeviceCompatibility:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pickLivePhoto:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// ✅ New: Pick Live Photo + transcription
RCT_EXTERN_METHOD(pickLivePhotoWithTranscription:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end
