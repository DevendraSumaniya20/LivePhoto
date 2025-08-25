//
//  AudioExtractor.m
//  LivePhoto
//
//  Created by BIRAJTECH on 25/08/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioExtractor, NSObject)

RCT_EXTERN_METHOD(extractAudio:(NSString *)videoPath
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end
