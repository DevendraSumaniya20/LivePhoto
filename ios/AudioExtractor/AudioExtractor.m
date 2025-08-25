#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioExtractor, NSObject)

RCT_EXTERN_METHOD(extractAudio:(NSString *)videoPath
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup;

@end