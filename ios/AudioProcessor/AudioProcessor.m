//
//  AudioProcessor.m
//  LivePhoto
//
//  Created by BIRAJTECH on 26/08/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioProcessor, NSObject)

RCT_EXTERN_METHOD(cleanAudio:(NSString *)inputPath
                  outputPath:(NSString *)outputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
