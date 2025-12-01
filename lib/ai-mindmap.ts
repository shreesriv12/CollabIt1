import OpenAI from 'openai';

export interface MindMapNode {
  id: string;
  title: string;
  description?: string;
  children?: MindMapNode[];
  level: number;
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface MindMapData {
  centralTopic: string;
  nodes: MindMapNode[];
  connections: Array<{
    from: string;
    to: string;
  }>;
}

class OpenRouterAI {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async generateMindMap(topic: string, complexity: 'simple' | 'detailed' | 'complex' = 'detailed'): Promise<MindMapData> {
    const complexitySettings = {
      simple: { maxBranches: 4, maxDepth: 2, description: "simple and focused" },
      detailed: { maxBranches: 6, maxDepth: 3, description: "detailed with good coverage" },
      complex: { maxBranches: 8, maxDepth: 4, description: "comprehensive and in-depth" }
    };

    const settings = complexitySettings[complexity];

    const systemPrompt = `You are an expert mind map creator. Create a ${settings.description} mind map for the given topic.

Guidelines:
- Create a hierarchical structure with the main topic at the center
- Generate ${settings.maxBranches} main branches maximum
- Each branch can have up to ${settings.maxDepth} levels of sub-topics
- Ensure logical relationships between concepts
- Make each node title concise (2-5 words)
- Provide brief descriptions for important nodes
- Use varied colors for different branches

Return the response as a valid JSON object with this exact structure:
{
  "centralTopic": "Main Topic",
  "nodes": [
    {
      "id": "unique_id",
      "title": "Node Title",
      "description": "Brief description (optional)",
      "level": 0,
      "parentId": "parent_id_or_null_for_root",
      "color": "#color_code"
    }
  ]
}

Important:
- The central topic node should have level 0 and parentId null
- Each node must have a unique ID
- Use different colors for main branches (#3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #06B6D4, #84CC16, #F97316)
- Keep titles short and descriptive
- Only return the JSON object, no additional text`;

    try {
      const response = await this.client.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Create a mind map for the topic: "${topic}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      let mindMapData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        mindMapData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid JSON response from AI');
      }

      // Validate and process the response
      return this.processMindMapData(mindMapData);

    } catch (error) {
      console.error('Error generating mind map:', error);
      throw error;
    }
  }

  private processMindMapData(data: any): MindMapData {
    if (!data.centralTopic || !data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid mind map data structure');
    }

    // Calculate positions for nodes
    const processedNodes: MindMapNode[] = [];
    const connections: Array<{ from: string; to: string }> = [];

    // Group nodes by level
    const nodesByLevel: { [key: number]: any[] } = {};
    data.nodes.forEach((node: any) => {
      if (!nodesByLevel[node.level]) {
        nodesByLevel[node.level] = [];
      }
      nodesByLevel[node.level].push(node);
    });

    // Calculate positions
    Object.keys(nodesByLevel).forEach((levelStr) => {
      const level = parseInt(levelStr);
      const nodes = nodesByLevel[level];
      
      nodes.forEach((node: any, index: number) => {
        let x, y;
        
        if (level === 0) {
          // Central node
          x = 400;
          y = 300;
        } else {
          // Arrange nodes in a circular pattern around their parent
          const angle = (index * 2 * Math.PI) / nodes.length;
          const radius = 150 + (level * 100);
          x = 400 + radius * Math.cos(angle);
          y = 300 + radius * Math.sin(angle);
        }

        processedNodes.push({
          id: node.id || `node_${Date.now()}_${index}`,
          title: node.title || 'Untitled',
          description: node.description,
          level: level,
          parentId: node.parentId,
          x: Math.round(x),
          y: Math.round(y),
          width: 120,
          height: 60,
          color: node.color || this.getRandomColor(),
          children: []
        });

        // Create connections
        if (node.parentId) {
          connections.push({
            from: node.parentId,
            to: node.id || `node_${Date.now()}_${index}`
          });
        }
      });
    });

    return {
      centralTopic: data.centralTopic,
      nodes: processedNodes,
      connections
    };
  }

  private getRandomColor(): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async generateMindMapFromText(text: string): Promise<MindMapData> {
    const systemPrompt = `Analyze the given text and create a mind map that captures the key concepts and their relationships.

Extract the main topic and create a hierarchical structure showing:
- Main themes and concepts
- Supporting details
- Relationships between ideas
- Key points and sub-points

Return a JSON object with the same structure as before.`;

    try {
      const response = await this.client.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze this text and create a mind map: "${text}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const mindMapData = JSON.parse(jsonString);

      return this.processMindMapData(mindMapData);

    } catch (error) {
      console.error('Error generating mind map from text:', error);
      throw error;
    }
  }
}

export const openRouterAI = new OpenRouterAI();