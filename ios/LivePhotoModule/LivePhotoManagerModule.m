//
//  LivePhotoManagerModule.m
//  LivePhoto
//
//  Exposes Swift LivePhotoManager to React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LivePhotoManager, NSObject)

RCT_EXTERN_METHOD(checkDeviceCompatibility:
                  (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pickLivePhoto:
                  (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end


