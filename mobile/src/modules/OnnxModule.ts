import { NativeModules, Platform } from 'react-native';

const { OnnxModule } = NativeModules;

export interface Detection {
    label: string;
    confidence: number;
    box: string; // JSON string "[x, y, w, h]"
}

export interface MLResult {
    detections: Detection[];
    severity_score: number;
    advisory: string;
}

interface OnnxModuleInterface {
    loadModel(modelPath: string): Promise<boolean>;
    runInference(imageUri: string): Promise<MLResult>;
}

// Default export is the Native Module cast to the interface
export default OnnxModule as OnnxModuleInterface;
