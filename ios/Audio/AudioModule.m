//
//  AudioModule.m
//  LivePhoto
//
//  Created by BIRAJTECH on 27/08/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioModule, NSObject)

// ✅ Extract and clean audio from video
RCT_EXTERN_METHOD(extractCleanAudio:(NSString *)videoPath
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// ✅ Transcribe audio file
RCT_EXTERN_METHOD(transcribeAudio:(NSString *)audioPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
