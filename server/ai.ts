import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIAnalysisResult {
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    priority: string;
    resourceId?: number;
    resourceType?: string;
  }>;
  healthScore: number;
  predictions: Array<{
    metric: string;
    timeframe: string;
    prediction: string;
    confidence: number;
  }>;
}

export async function analyzeInfrastructure(
  vms: any[],
  metrics: any,
  alerts: any[]
): Promise<AIAnalysisResult> {
  try {
    const prompt = `
    Analyze the following cloud infrastructure data and provide recommendations:

    Virtual Machines:
    ${JSON.stringify(vms, null, 2)}

    System Metrics:
    ${JSON.stringify(metrics, null, 2)}

    Current Alerts:
    ${JSON.stringify(alerts, null, 2)}

    Please provide a JSON response with:
    1. recommendations: Array of actionable recommendations with type, title, description, confidence (0-1), priority (low/medium/high), and optionally resourceId/resourceType
    2. healthScore: Overall infrastructure health score (0-100)
    3. predictions: Array of predictions with metric, timeframe, prediction description, and confidence

    Focus on:
    - Resource optimization opportunities
    - Security concerns
    - Capacity planning
    - Performance improvements
    - Cost optimization
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert cloud infrastructure analyst. Provide detailed, actionable insights for optimizing private cloud environments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and structure the response
    return {
      recommendations: result.recommendations || [],
      healthScore: Math.max(0, Math.min(100, result.healthScore || 85)),
      predictions: result.predictions || []
    };

  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Return fallback recommendations if AI fails
    return {
      recommendations: [
        {
          type: "optimization",
          title: "Resource Analysis Available",
          description: "AI analysis is temporarily unavailable. Manual infrastructure review recommended.",
          confidence: 0.5,
          priority: "medium"
        }
      ],
      healthScore: 85,
      predictions: [
        {
          metric: "capacity",
          timeframe: "30 days",
          prediction: "Monitor resource usage trends for capacity planning",
          confidence: 0.7
        }
      ]
    };
  }
}

export async function generateOptimizationSuggestions(vmData: any): Promise<string> {
  try {
    const prompt = `
    Based on this VM configuration and usage data, provide specific optimization suggestions:
    ${JSON.stringify(vmData, null, 2)}

    Focus on CPU, memory, and storage optimization opportunities.
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a cloud optimization expert. Provide concise, actionable optimization suggestions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200
    });

    return response.choices[0].message.content || "No specific optimizations identified.";
  } catch (error) {
    console.error("Optimization suggestion error:", error);
    return "Unable to generate optimization suggestions at this time.";
  }
}

export async function predictResourceNeeds(historicalData: any[]): Promise<any> {
  try {
    const prompt = `
    Based on this historical resource usage data, predict future resource needs:
    ${JSON.stringify(historicalData.slice(-10), null, 2)}

    Provide predictions for the next 30, 60, and 90 days including:
    - Storage capacity needs
    - CPU requirements
    - Memory requirements
    - Network bandwidth

    Respond in JSON format with structured predictions.
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a capacity planning expert for cloud infrastructure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Resource prediction error:", error);
    return {
      predictions: [],
      error: "Unable to generate resource predictions"
    };
  }
}
