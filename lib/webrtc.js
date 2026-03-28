// ============================================
// WebRTC INFRASTRUCTURE & CONFIGURATION
// Handles video/audio calls using WebRTC
// ============================================

// ICE (Interactive Connectivity Establishment) Servers
// These help establish P2P connections through NAT/Firewalls
export const WEBRTC_CONFIG = {
  iceServers: [
    // STUN Servers (Free, public)
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
    // TURN Server (Optional - for relay through firewall)
    // Configure your own TURN server for better reliability
    {
      urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL || "turn:example.com:3478",
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD,
    },
  ],
  iceCandidatePoolSize: 10,
};

// Video constraints
export const VIDEO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    minWidth: 320,
    minHeight: 180,
    maxWidth: 1920,
    maxHeight: 1080,
    facingMode: "user",
  },
};

// Screen sharing constraints
export const SCREEN_CONSTRAINTS = {
  audio: false,
  video: {
    cursor: "always", // show, hide, always
  },
};

// Media stream recorder options
export const RECORDER_OPTIONS = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: "video/webm;codecs=vp9,opus",
};

// ============================================
// WebRTC Peer Connection Manager
// ============================================

export class WebRTCPeerManager {
  constructor(config = WEBRTC_CONFIG) {
    this.config = config;
    this.peers = new Map(); // peerId -> RTCPeerConnection
    this.localStream = null;
    this.screenStream = null;
    this.dataChannels = new Map(); // peerId -> RTCDataChannel
    this.eventHandlers = {};
  }

  // Initialize local stream
  async initializeLocalStream(constraints = VIDEO_CONSTRAINTS) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.triggerEvent("localStream", this.localStream);
      return this.localStream;
    } catch (error) {
      console.error("[WebRTC] Failed to get user media:", error);
      throw error;
    }
  }

  // Stop local stream
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  // Start screen sharing
  async startScreenShare() {
    try {
      this.screenStream =
        await navigator.mediaDevices.getDisplayMedia(SCREEN_CONSTRAINTS);
      const screenTrack = this.screenStream.getVideoTracks()[0];

      // Replace video tracks in all peer connections
      for (const [peerId, peerConnection] of this.peers) {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
      }

      this.triggerEvent("screenShare:started", this.screenStream);
      return this.screenStream;
    } catch (error) {
      console.error("[WebRTC] Failed to start screen share:", error);
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    if (this.screenStream) {
      const screenTrack = this.screenStream.getVideoTracks()[0];
      const cameraTrack = this.localStream?.getVideoTracks()[0];

      // Replace screen track with camera track
      for (const [peerId, peerConnection] of this.peers) {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender && cameraTrack) {
          await sender.replaceTrack(cameraTrack);
        }
      }

      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
      this.triggerEvent("screenShare:stopped");
    }
  }

  // Create peer connection
  async createPeerConnection(peerId, onIceCandidate, onRemoteStream) {
    try {
      const peerConnection = new RTCPeerConnection(this.config);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          onIceCandidate(event.candidate);
        }
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("[WebRTC] Remote track received", event.track.kind);
        onRemoteStream(event.streams[0]);
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `[WebRTC] Connection state: ${peerConnection.connectionState}`,
        );
        this.triggerEvent("connectionStateChange", {
          peerId,
          state: peerConnection.connectionState,
        });
      };

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE state: ${peerConnection.iceConnectionState}`);
      };

      // Create data channel for chat during call
      const dataChannel = peerConnection.createDataChannel("chat");
      this.setupDataChannel(peerId, dataChannel);

      // Handle incoming data channels
      peerConnection.ondatachannel = (event) => {
        this.setupDataChannel(peerId, event.channel);
      };

      this.peers.set(peerId, peerConnection);
      return peerConnection;
    } catch (error) {
      console.error("[WebRTC] Failed to create peer connection:", error);
      throw error;
    }
  }

  // Setup data channel for chat
  setupDataChannel(peerId, dataChannel) {
    dataChannel.onopen = () => {
      console.log(`[DataChannel] Opened for ${peerId}`);
      this.triggerEvent("dataChannelOpen", { peerId });
    };

    dataChannel.onclose = () => {
      console.log(`[DataChannel] Closed for ${peerId}`);
    };

    dataChannel.onmessage = (event) => {
      this.triggerEvent("dataChannelMessage", {
        peerId,
        message: JSON.parse(event.data),
      });
    };

    this.dataChannels.set(peerId, dataChannel);
  }

  // Send data through data channel
  sendDataChannelMessage(peerId, message) {
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(JSON.stringify(message));
    }
  }

  // Create offer
  async createOffer(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) throw new Error(`Peer ${peerId} not found`);

    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Create answer
  async createAnswer(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) throw new Error(`Peer ${peerId} not found`);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Add ICE candidate
  async addIceCandidate(peerId, candidate) {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) throw new Error(`Peer ${peerId} not found`);

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("[WebRTC] Failed to add ICE candidate:", error);
    }
  }

  // Set remote description
  async setRemoteDescription(peerId, description) {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) throw new Error(`Peer ${peerId} not found`);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(description),
    );
  }

  // Get connection stats
  async getStats(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) return null;

    const stats = {
      audio: {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0,
      },
      video: {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0,
      },
      connection: { currentRoundTripTime: 0, availableOutgoingBitrate: 0 },
    };

    const reports = await peerConnection.getStats();
    reports.forEach((report) => {
      if (report.type === "inbound-rtp") {
        const kind = report.mediaType || report.kind;
        if (kind === "audio" || kind === "video") {
          stats[kind].bytesReceived = report.bytesReceived;
          stats[kind].packetsReceived = report.packetsReceived;
        }
      } else if (report.type === "outbound-rtp") {
        const kind = report.mediaType || report.kind;
        if (kind === "audio" || kind === "video") {
          stats[kind].bytesSent = report.bytesSent;
          stats[kind].packetsSent = report.packetsSent;
        }
      } else if (
        report.type === "candidate-pair" &&
        report.state === "succeeded"
      ) {
        stats.connection.currentRoundTripTime = report.currentRoundTripTime;
        stats.connection.availableOutgoingBitrate =
          report.availableOutgoingBitrate;
      }
    });

    return stats;
  }

  // Toggle audio
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle video
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  // Close peer connection
  closePeerConnection(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
      this.dataChannels.delete(peerId);
    }
  }

  // Close all connections
  closeAllConnections() {
    for (const [peerId] of this.peers) {
      this.closePeerConnection(peerId);
    }
    this.stopLocalStream();
    this.stopScreenShare();
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(
        (h) => h !== handler,
      );
    }
  }

  triggerEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => handler(data));
    }
  }
}

export default WebRTCPeerManager;
