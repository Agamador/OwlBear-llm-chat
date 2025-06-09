# 🧙‍♂️ OwlBear AI Game Master 🐉

## 🎥 Video Demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/SlbW-kjekBg?si=r6x8GeVnKLipriZL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Video Demo: [https://www.youtube.com/watch?v=SlbW-kjekBg&ab_channel=AlejandroGarcíaAmador](https://www.youtube.com/watch?v=SlbW-kjekBg&ab_channel=AlejandroGarcíaAmador)

## 🧩 Complete Architecture Overview
![Architecture Overview](https://huggingface.co/spaces/Agents-MCP-Hackathon/LLM-GameMaster-Agent/resolve/main/media/architecture.png)

## 🔗 Useful Links:
- [Agent](https://huggingface.co/spaces/Agents-MCP-Hackathon/LLM-GameMaster-Agent)
- [MCP Server](https://huggingface.co/spaces/Agents-MCP-Hackathon/LLM-GameMaster-MCP-Server)
- [Video Demo](https://www.youtube.com/watch?v=SlbW-kjekBg&ab_channel=AlejandroGarcíaAmador)

## 🌟 Introduction

The **OwlBear LLM Chat Extension** is a revolutionary AI-powered companion designed specifically for [Owlbear Rodeo](https://www.owlbear.rodeo/), the popular virtual tabletop platform. This sophisticated system seamlessly integrates an intelligent Dungeon Master assistant directly into your gaming sessions, creating an unprecedented fusion of traditional tabletop role-playing and cutting-edge artificial intelligence technology.

Unlike conventional chat applications, this innovative extension transforms your Owlbear Rodeo experience by providing a contextually-aware AI that understands and interacts with your game state in real-time. The system dynamically observes player positions, map layouts, fog of war status, tokens, and environmental elements to deliver incredibly immersive and personalized gaming experiences that adapt to every action your party takes.

## 🎮 Owlbear Rodeo Integration Architecture

The extension operates through a sophisticated dual-component architecture that bridges the gap between your virtual tabletop and AI intelligence. The system consists of a **Vite-powered browser extension** that runs directly within Owlbear Rodeo and a **Node.js Express backend** that handles AI communications and real-time synchronization.

The browser extension leverages the powerful [Owlbear Rodeo SDK](https://docs.owlbear.rodeo/sdk/getting-started) to create deep integration capabilities. Through this SDK connection, the AI can observe and manipulate virtually every aspect of your gaming session - from moving tokens and managing fog of war to creating dynamic lighting effects and spawning new creatures based on narrative developments.


## 🚀 Real-Time Game State Awareness

What sets this extension apart is its unprecedented ability to understand and respond to your complete game state. The system continuously monitors player positions, environmental elements, map configurations, and session metadata to provide contextually relevant responses and actions.

When players move their tokens across the battlefield, the AI instantly recognizes positional changes and can suggest tactical opportunities or narrative developments based on the new formation. If fog of war reveals a hidden chamber, the AI immediately incorporates this discovery into the ongoing storyline, creating seamless narrative flow that feels natural and responsive.

The game state integration includes comprehensive tracking of:
- **Player tokens and their precise positions** on the battle map
- **Environmental objects and interactive elements** placed throughout the scene
- **Fog of war status** and exploration progress
- **Light sources and visibility conditions** affecting gameplay
- **Custom metadata and session-specific information** stored by the game master

## 🖥️ Vite-Powered Browser Extension

The client-side component is built using modern [Vite](https://vitejs.dev/) development tools, ensuring lightning-fast performance and seamless integration with Owlbear Rodeo's web-based interface. This sophisticated browser extension creates an elegant chat interface that appears naturally within your gaming session without disrupting the immersive experience.

The extension implements advanced Server-Sent Events (SSE) technology to maintain real-time bidirectional communication with the backend server. This architecture allows for instant synchronization between multiple players and ensures that AI responses are delivered with minimal latency, maintaining the natural flow of conversation that's essential for engaging role-playing experiences.

Key features of the browser extension include:
- **Markdown-powered message rendering** for rich text formatting and beautiful presentation
- **Persistent chat history** stored securely within your Owlbear Rodeo room metadata
- **Intuitive API key management** with secure validation and storage
- **Real-time connection monitoring** with automatic reconnection capabilities
- **Cross-browser compatibility** ensuring consistent experience across all major browsers

## ⚙️ Express.js Backend Server

The server component is powered by a robust [Express.js](https://expressjs.com/) application that serves as the central hub for AI communications and session management. This sophisticated backend handles multiple concurrent gaming sessions through a unique tab-based identification system, ensuring that each table's conversations and game state remain completely isolated and secure.

The server implements advanced promise-based request handling that allows external clients to execute actions within Owlbear Rodeo sessions and receive real-time responses. This architecture enables powerful automation possibilities, from simple dice rolling to complex scenario generation based on current game conditions.

The backend provides comprehensive API endpoints for:
- **Session management and player connection tracking** across multiple concurrent games
- **Secure API key validation** with Anthropic Claude integration testing
- **Bidirectional action execution** between external clients and active gaming sessions
- **Real-time response handling** with configurable timeout management
- **HTTPS/SSL support** for secure communications in production environments

## 🤖 Claude AI Integration

The system leverages [Anthropic's Claude](https://www.anthropic.com/claude) language models to deliver sophisticated AI-powered game mastering capabilities. The integration goes far beyond simple text generation, incorporating comprehensive game state analysis to provide contextually appropriate responses that enhance rather than disrupt the natural flow of gameplay.

The AI integration includes several advanced features that make the experience feel truly magical:
- **Dynamic narrative generation** that adapts to player choices and environmental changes
- **Contextual action suggestions** based on current game state and player positioning
- **Intelligent scene description** that incorporates visual elements from the virtual tabletop
- **Adaptive difficulty scaling** that responds to party composition and progress
- **Seamless tool integration** for executing complex Owlbear Rodeo actions through natural language

## 🔧 Advanced Tool Integration

One of the most impressive aspects of this extension is its comprehensive suite of integrated tools that allow the AI to directly manipulate your gaming environment. Through the sophisticated action system built into the Owlbear Rodeo SDK, the AI can perform complex operations that would typically require manual intervention from a human game master.

The tool integration includes powerful capabilities such as:
- **Dynamic token creation and management** with support for custom character assets
- **Intelligent fog of war manipulation** that reveals areas based on narrative progression
- **Automated lighting system control** for creating atmospheric effects and managing visibility
- **Real-time map modifications** including the ability to spawn environmental objects and terrain features
- **Advanced viewport control** for cinematic camera movements and dramatic reveals
- **Comprehensive scene management** with the ability to clear areas and reset environments

These tools work seamlessly together to create truly dynamic gaming experiences where the virtual environment responds organically to story developments and player actions.

## 🔗 Links & Resources

- [Owlbear Rodeo Platform](https://www.owlbear.rodeo/)
- [Owlbear Rodeo SDK Documentation](https://docs.owlbear.rodeo/sdk/getting-started)
- [Vite Build Tool](https://vitejs.dev/)
- [Express.js Framework](https://expressjs.com/)
- [Anthropic Claude API](https://www.anthropic.com/claude)
- [Server-Sent Events Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)