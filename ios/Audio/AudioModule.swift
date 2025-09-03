//
//  AudioModule.swift
//  LivePhoto
//
//  Created by BIRAJTECH on 27/08/25.
//

import Foundation
import AVFoundation
import React
import Speech
import Accelerate

@objc(AudioModule)
class AudioModule: NSObject {

  // MARK: - Extract and Clean Audio in One Step
  
  // MARK: - Transcribe Audio with Pre-check
  @objc(transcribeAudio:resolver:rejecter:)
  func transcribeAudio(audioPath: String,
                       resolver: @escaping RCTPromiseResolveBlock,
                       rejecter: @escaping RCTPromiseRejectBlock) {

    guard FileManager.default.fileExists(atPath: audioPath) else {
      resolver(nil)
      return
    }

    // Pre-check RMS level
    var rmsValue: Double = 0
    do {
      let file = try AVAudioFile(forReading: URL(fileURLWithPath: audioPath))
      let format = file.processingFormat
      let frameCount = UInt32(file.length)
      guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { throw NSError() }
      try file.read(into: buffer)
      if let channelData = buffer.floatChannelData?[0] {
        let frameLength = Int(buffer.frameLength)
        rmsValue = sqrt((0..<frameLength).reduce(0.0) { $0 + Double(channelData[$1] * channelData[$1]) } / Double(frameLength))
      }
    } catch {
      NSLog("⚠️ [transcribeAudio] Pre-check failed: %@", error.localizedDescription)
    }

    if rmsValue < 0.001 {
      resolver(nil)
      return
    }

    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")), recognizer.isAvailable else {
      resolver(nil)
      return
    }

    let url = URL(fileURLWithPath: audioPath)
    let request = SFSpeechURLRecognitionRequest(url: url)
    request.requiresOnDeviceRecognition = true

    recognizer.recognitionTask(with: request) { result, error in
      if let result = result, result.isFinal {
        resolver(result.bestTranscription.formattedString)
      } else {
        resolver(nil)
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
