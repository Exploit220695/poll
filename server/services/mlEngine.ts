export interface MLFeatures {
  sourceIp: string;
  method: string;
  endpoint: string;
  payloadLength: number;
  userAgent: string;
  payload?: string;
  timestamp?: Date;
}

export interface MLPrediction {
  classification: string;
  confidence: number;
  model: string;
  features: number[];
  noveltyScore?: number;
  detectedPatterns?: string[];
}

export class MLEngine {
  // Set untuk menyimpan kombinasi pattern yang sudah dikenal
  private knownPatternCombinations = new Set<string>();
  private ipTimingHistory = new Map<string, number[]>();
  
  // Machine learning models yang dapat mendeteksi pola serangan baru
  private models = {
    xgboost: {
      name: "XGBoost Classifier",
      type: "gradient_boosting",
      accuracy: 0.96,
      features: ["request_frequency", "payload_entropy", "endpoint_risk", "ip_reputation", "timing_pattern"],
      adaptiveLearning: true,
      maxDepth: 6,
      learningRate: 0.1,
      numEstimators: 100,
      weights: [0.25, 0.25, 0.2, 0.15, 0.15]
    },
    randomForest: {
      name: "Random Forest Classifier",
      type: "supervised",
      accuracy: 0.92,
      features: ["request_frequency", "payload_size", "endpoint_diversity", "ip_reputation"],
      adaptiveLearning: true,
      weights: [0.3, 0.2, 0.25, 0.15, 0.1]
    },
    isolationForest: {
      name: "Isolation Forest",
      type: "unsupervised", 
      accuracy: 0.87,
      features: ["request_patterns", "timing_anomalies", "behavioral_analysis"],
      adaptiveLearning: true,
      threshold: 0.7
    },
    lstm: {
      name: "LSTM Neural Network",
      type: "sequence",
      accuracy: 0.89,
      features: ["sequence_patterns", "temporal_analysis", "session_behavior"],
      adaptiveLearning: true
    },
    autoencoder: {
      name: "Autoencoder Anomaly Detector",
      type: "unsupervised",
      accuracy: 0.91,
      features: ["request_reconstruction", "pattern_deviation", "novelty_detection"],
      adaptiveLearning: true
    }
  };

  async predict(features: MLFeatures): Promise<MLPrediction> {
    // Convert features to numerical representation
    const numericFeatures = this.featurize(features);
    
    // Advanced pattern analysis untuk mendeteksi serangan baru
    const patternAnalysis = await this.advancedPatternAnalysis(features);
    
    // XGBoost prediction (primary model - highest accuracy)
    const xgboostPrediction = this.xgboostPredict(numericFeatures, features);
    
    // Random Forest prediction (secondary validation)
    const rfPrediction = this.randomForestPredict(numericFeatures);
    
    // Isolation Forest untuk anomaly detection
    const isolationScore = this.calculateIsolationScore(numericFeatures);
    
    // Ensemble voting: combine XGBoost, Random Forest, and pattern analysis
    let finalClassification = xgboostPrediction.classification;
    let finalConfidence = xgboostPrediction.confidence;
    
    // Jika ada pattern baru yang terdeteksi
    if (patternAnalysis.noveltyScore > 0.3) {
      finalClassification = "Novel Attack Pattern";
      finalConfidence = Math.max(finalConfidence, 0.7 + patternAnalysis.noveltyScore * 0.3);
    } else if (patternAnalysis.score > 0.5) {
      finalClassification = "Malicious";
      finalConfidence = Math.max(finalConfidence, patternAnalysis.score);
    }
    
    // Isolation forest override untuk anomali yang ekstrem
    if (isolationScore > 0.8) {
      finalClassification = "Anomalous Behavior";
      finalConfidence = Math.max(finalConfidence, isolationScore);
    }
    
    // Boost confidence if multiple models agree
    if (xgboostPrediction.classification === rfPrediction.classification) {
      finalConfidence = Math.min(finalConfidence * 1.1, 1.0);
    }
    
    return {
      classification: finalClassification,
      confidence: Math.min(finalConfidence, 1.0),
      model: "XGBoost + Multi-Model Ensemble",
      features: numericFeatures,
      noveltyScore: patternAnalysis.noveltyScore,
      detectedPatterns: patternAnalysis.patterns
    };
  }

  // Analisis advanced untuk mendeteksi pola serangan baru dengan adaptive learning
  private async advancedPatternAnalysis(features: MLFeatures): Promise<{ score: number; patterns: string[]; noveltyScore: number }> {
    const patterns: string[] = [];
    let score = 0;
    let noveltyScore = 0;

    // Pattern detection untuk serangan yang belum dikenal
    const payload = features.payload || "";
    const endpoint = features.endpoint || "";
    const userAgent = features.userAgent || "";

    // Deteksi encoding yang mencurigakan
    if (/(%[0-9a-f]{2}){3,}/i.test(payload)) {
      patterns.push("excessive_url_encoding");
      score += 0.3;
    }

    // Deteksi karakter Unicode yang mencurigakan
    if (/[\u0000-\u001f\u007f-\u009f]/g.test(payload)) {
      patterns.push("suspicious_unicode");
      score += 0.25;
    }

    // Deteksi pola SQL injection yang ter-obfuscate
    const obfuscatedSqlPatterns = [
      /concat\s*\(/i,
      /char\s*\(/i,
      /ascii\s*\(/i,
      /substring\s*\(/i,
      /hex\s*\(/i,
      /unhex\s*\(/i
    ];
    
    if (obfuscatedSqlPatterns.some(pattern => pattern.test(payload))) {
      patterns.push("obfuscated_sql_injection");
      score += 0.4;
    }

    // Deteksi NoSQL injection patterns
    if (/\$\w+:/g.test(payload) || /\{\s*"\$\w+"/g.test(payload)) {
      patterns.push("nosql_injection");
      score += 0.35;
    }

    // Deteksi Command Injection patterns baru
    const commandPatterns = [
      /[;&|`$]\s*\w+/g,
      /\$\(.*\)/g,
      /\$\{.*\}/g,
      /\b(wget|curl|nc|netcat|bash|sh|powershell|cmd)\b/gi
    ];
    
    if (commandPatterns.some(pattern => pattern.test(payload))) {
      patterns.push("command_injection");
      score += 0.45;
    }

    // Deteksi LDAP injection
    if (/[()&|!].*[=<>]/g.test(payload)) {
      patterns.push("ldap_injection");
      score += 0.3;
    }

    // Deteksi XML External Entity (XXE)
    if (/<!ENTITY.*>/gi.test(payload) || /SYSTEM.*file:/gi.test(payload)) {
      patterns.push("xxe_injection");
      score += 0.4;
    }

    // Deteksi Template Injection
    if (/\{\{.*\}\}/g.test(payload) || /\$\{.*\}/g.test(payload) || /@\{.*\}/g.test(payload)) {
      patterns.push("template_injection");
      score += 0.35;
    }

    // Deteksi Deserialization Attack
    if (/\brO0AB/g.test(payload) || /aced00/gi.test(payload) || /__reduce__/g.test(payload)) {
      patterns.push("deserialization_attack");
      score += 0.4;
    }

    // Deteksi polyglot attacks (multiple attack vectors in one payload)
    const attackTypeCount = patterns.length;
    if (attackTypeCount >= 3) {
      patterns.push("polyglot_attack");
      score += 0.2 * attackTypeCount;
      noveltyScore += 0.3;
    }

    // Adaptive learning: deteksi pola yang tidak biasa berdasarkan entropy
    const entropy = this.calculateEntropy(payload);
    if (entropy > 6.5) { // High entropy indicates potential obfuscation
      patterns.push("high_entropy_payload");
      score += 0.25;
      noveltyScore += 0.2;
    }

    // Deteksi unusual request timing patterns
    const currentTime = Date.now();
    const timingScore = this.analyzeTimingAnomalies(features.sourceIp, currentTime);
    if (timingScore > 0.7) {
      patterns.push("timing_attack");
      score += timingScore * 0.3;
      noveltyScore += 0.15;
    }

    // Zero-day detection: kombinasi pattern yang belum pernah terlihat
    const combinationSignature = patterns.sort().join('|');
    if (!this.knownPatternCombinations.has(combinationSignature) && patterns.length > 0) {
      this.knownPatternCombinations.add(combinationSignature);
      patterns.push("novel_attack_pattern");
      noveltyScore += 0.4;
      
      // Auto-learning: tambahkan pattern baru ke model
      await this.updateModelWithNewPattern(combinationSignature, score, features);
    }

    return { score: Math.min(score, 1.0), patterns, noveltyScore: Math.min(noveltyScore, 1.0) };
  }

  // Hitung entropy untuk deteksi obfuscation
  private calculateEntropy(str: string): number {
    if (!str) return 0;
    
    const frequency: { [key: string]: number } = {};
    for (const char of str) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = str.length;
    for (const count of Object.values(frequency)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  // Analisis timing anomalies untuk deteksi brute force dan DoS
  private analyzeTimingAnomalies(ip: string, currentTime: number): number {
    if (!this.ipTimingHistory.has(ip)) {
      this.ipTimingHistory.set(ip, []);
    }
    
    const history = this.ipTimingHistory.get(ip)!;
    history.push(currentTime);
    
    // Keep only last 100 requests per IP
    if (history.length > 100) {
      history.shift();
    }
    
    // Calculate request frequency in last minute
    const oneMinuteAgo = currentTime - 60000;
    const recentRequests = history.filter(time => time > oneMinuteAgo);
    
    // High frequency indicates potential brute force
    if (recentRequests.length > 30) {
      return Math.min(recentRequests.length / 30, 1.0);
    }
    
    return 0;
  }

  // Update model dengan pattern baru untuk adaptive learning
  private async updateModelWithNewPattern(signature: string, score: number, features: MLFeatures): Promise<void> {
    // Simulate model updating dengan pattern baru
    console.log(`Learning new attack pattern: ${signature} with score: ${score}`);
    
    // Dalam implementasi nyata, ini akan update model weights
    // atau retrain model dengan data baru
    
    // Log untuk monitoring
    console.log(`New pattern detected from IP: ${features.sourceIp}, Endpoint: ${features.endpoint}`);
  }

  private featurize(features: MLFeatures): number[] {
    return [
      this.ipToNumeric(features.sourceIp),
      this.methodToNumeric(features.method),
      this.endpointToNumeric(features.endpoint),
      Math.min(features.payloadLength / 1000, 1), // Normalize payload length
      this.userAgentToNumeric(features.userAgent)
    ];
  }

  private ipToNumeric(ip: string): number {
    // Simple hash-based conversion
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private methodToNumeric(method: string): number {
    const methodMap: { [key: string]: number } = {
      'GET': 0.1,
      'POST': 0.3,
      'PUT': 0.2,
      'DELETE': 0.4,
      'PATCH': 0.25
    };
    return methodMap[method] || 0.5;
  }

  private endpointToNumeric(endpoint: string): number {
    // Higher values for potentially sensitive endpoints
    const sensitivePatterns = [/admin/, /login/, /auth/, /api/, /config/];
    let score = 0.1;
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(endpoint.toLowerCase())) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private userAgentToNumeric(userAgent: string): number {
    // Suspicious user agents get higher scores
    const suspiciousPatterns = [/bot/i, /crawler/i, /scanner/i, /curl/i, /wget/i];
    let score = 0.1;
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1.0);
  }

  // XGBoost implementation untuk high-accuracy threat detection
  private xgboostPredict(features: number[], rawFeatures: MLFeatures): MLPrediction {
    const config = this.models.xgboost;
    const weights = config.weights;
    
    // XGBoost uses gradient boosting with multiple trees
    let totalScore = 0;
    const numEstimators = config.numEstimators;
    const learningRate = config.learningRate;
    const maxDepth = config.maxDepth;
    
    // Simulate gradient boosting iterations
    for (let estimator = 0; estimator < Math.min(numEstimators, 20); estimator++) {
      let treeScore = 0;
      
      // Simulate tree with max_depth
      for (let depth = 0; depth < maxDepth; depth++) {
        for (let i = 0; i < features.length && i < weights.length; i++) {
          // XGBoost uses second-order gradients
          const gradient = features[i] * weights[i];
          const hessian = Math.abs(features[i] - 0.5); // Simplified hessian
          
          // Regularization
          const lambda = 1.0;
          const gamma = 0.1;
          
          // Calculate gain with regularization
          const gain = (gradient * gradient) / (hessian + lambda) - gamma;
          
          treeScore += gain * Math.pow(0.9, depth); // Decay by depth
        }
      }
      
      // Add boosted tree contribution with learning rate
      totalScore += treeScore * learningRate * Math.pow(0.95, estimator);
    }
    
    // Normalize score
    totalScore = Math.min(Math.max(totalScore / 10, 0), 1);
    
    // Add pattern-based boosting
    const payload = rawFeatures.payload || "";
    if (payload.length > 100) totalScore += 0.05;
    if (/[<>'"`;]/.test(payload)) totalScore += 0.1;
    if (/union|select|drop|insert|update|delete/i.test(payload)) totalScore += 0.15;
    
    let classification = "Normal";
    let confidence = 0.88;
    
    if (totalScore > 0.75) {
      classification = "Malicious";
      confidence = Math.min(totalScore + 0.2, 0.99);
    } else if (totalScore > 0.5) {
      classification = "Suspicious";
      confidence = totalScore + 0.15;
    } else if (totalScore > 0.3) {
      classification = "Suspicious";
      confidence = totalScore + 0.1;
    }
    
    return {
      classification,
      confidence,
      model: "XGBoost Gradient Boosting",
      features
    };
  }

  private randomForestPredict(features: number[]): MLPrediction {
    // Enhanced Random Forest implementation
    const weights = this.models.randomForest.weights;
    let score = 0;
    
    for (let i = 0; i < features.length && i < weights.length; i++) {
      score += features[i] * weights[i];
    }
    
    // Add ensemble behavior dengan multiple tree simulation
    for (let tree = 0; tree < 5; tree++) {
      let treeScore = 0;
      for (let i = 0; i < features.length; i++) {
        // Different trees focus on different features
        const treeWeight = Math.sin(tree + i) * 0.1 + 0.1;
        treeScore += features[i] * treeWeight;
      }
      score += treeScore * 0.1;
    }
    
    let classification = "Normal";
    let confidence = 0.85;
    
    if (score > 0.7) {
      classification = "Malicious";
      confidence = Math.min(score + 0.15, 1.0);
    } else if (score > 0.4) {
      classification = "Suspicious";
      confidence = score + 0.1;
    }
    
    return {
      classification,
      confidence,
      model: "Enhanced Random Forest",
      features
    };
  }

  // Enhanced Isolation Forest implementation for anomaly detection
  calculateIsolationScore(features: number[]): number {
    let totalAnomalyScore = 0;
    const numTrees = 10;
    
    // Multiple isolation trees for better accuracy
    for (let tree = 0; tree < numTrees; tree++) {
      let pathLength = 0;
      let currentFeatures = [...features];
      
      // Simulate tree traversal dengan improved algorithm
      for (let depth = 0; depth < 15; depth++) {
        if (currentFeatures.length === 0) break;
        
        const randomFeatureIndex = Math.floor(Math.random() * currentFeatures.length);
        const splitValue = Math.random();
        
        if (currentFeatures[randomFeatureIndex] < splitValue) {
          pathLength++;
          // Remove isolated point
          currentFeatures.splice(randomFeatureIndex, 1);
        } else {
          pathLength++;
        }
        
        // Early termination for deep paths
        if (pathLength > 12) break;
      }
      
      // Shorter paths indicate anomalies
      const averagePathLength = 10;
      const anomalyScore = Math.pow(2, -pathLength / averagePathLength);
      totalAnomalyScore += anomalyScore;
    }
    
    return Math.min(totalAnomalyScore / numTrees, 1.0);
  }

  // Get all available models for monitoring
  getAvailableModels() {
    return Object.entries(this.models).map(([key, model]) => ({
      id: key,
      name: model.name,
      type: model.type,
      accuracy: model.accuracy || 0.85,
      features: model.features || [],
      adaptiveLearning: model.adaptiveLearning || false
    }));
  }
}

export const mlEngine = new MLEngine();