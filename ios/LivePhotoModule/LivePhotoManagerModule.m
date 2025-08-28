//
//  LivePhotoManagerModule.m
//  LivePhoto
//
//  Exposes Swift LivePhotoManager to React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LivePhotoManager, NSObject)

// Check if device supports Live Photos
RCT_EXTERN_METHOD(checkDeviceCompatibility:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Main method to pick and process Live Photo
RCT_EXTERN_METHOD(pickLivePhoto:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Test method to verify native module is working
RCT_EXTERN_METHOD(testMethod:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)


@end
