// VideoSDK API Configuration
const VIDEOSDK_API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "https://api.inventurcubes.com/api";

export interface VideoSDKToken {
  token: string;
  roomId: string;
}

export interface StreamData {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  roomId?: string;
  token?: string;
}

/**
 * Get VideoSDK token for authentication
 */
export const getVideoSDKToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${VIDEOSDK_API_BASE}/streams/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get VideoSDK token");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error getting VideoSDK token:", error);
    throw error;
  }
};

/**
 * Start a new live stream
 */
export const startStream = async (streamData: {
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
}): Promise<StreamData> => {
  try {
    const response = await fetch(`${VIDEOSDK_API_BASE}/streams/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(streamData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start stream");
    }

    const data = await response.json();
    return {
      id: data.stream._id,
      title: data.stream.title,
      description: data.stream.description,
      category: data.stream.category,
      thumbnail: data.stream.thumbnail,
      roomId: data.roomId,
      token: data.token,
    };
  } catch (error) {
    console.error("Error starting stream:", error);
    throw error;
  }
};

/**
 * Get my active stream
 */
export const getMyActiveStream = async (): Promise<StreamData | null> => {
  try {
    const response = await fetch(`${VIDEOSDK_API_BASE}/streams/my-active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No active stream
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to get active stream");
    }

    const data = await response.json();
    return {
      id: data.stream._id,
      title: data.stream.title,
      description: data.stream.description,
      category: data.stream.category,
      thumbnail: data.stream.thumbnail,
      roomId: data.stream.videoSdkRoomId,
    };
  } catch (error) {
    console.error("Error getting active stream:", error);
    throw error;
  }
};

/**
 * End a live stream
 */
export const endStream = async (streamId: string): Promise<void> => {
  try {
    const response = await fetch(`${VIDEOSDK_API_BASE}/streams/${streamId}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to end stream");
    }
  } catch (error) {
    console.error("Error ending stream:", error);
    throw error;
  }
};

/**
 * Join a live stream
 */
export const joinStream = async (streamId: string): Promise<{
  stream: any;
  roomId: string;
  token: string;
}> => {
  try {
    const response = await fetch(`${VIDEOSDK_API_BASE}/streams/${streamId}/join`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join stream");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error joining stream:", error);
    throw error;
  }
};

/**
 * Leave a live stream
 */
export const leaveStream = async (streamId: string): Promise<void> => {
  try {
    const response = await fetch(`${VIDEOSDK_API_BASE}/streams/${streamId}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to leave stream");
    }
  } catch (error) {
    console.error("Error leaving stream:", error);
    throw error;
  }
};

/**
 * Get all live streams
 */
export const getLiveStreams = async (category?: string): Promise<any[]> => {
  try {
    const url = category && category !== "all"
      ? `${VIDEOSDK_API_BASE}/streams/live?category=${category}`
      : `${VIDEOSDK_API_BASE}/streams/live`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get live streams");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting live streams:", error);
    return [];
  }
};

/**
 * Start recording
 */
export const startRecording = async (streamId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${VIDEOSDK_API_BASE}/streams/${streamId}/recording/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start recording");
    }
  } catch (error) {
    console.error("Error starting recording:", error);
    throw error;
  }
};

/**
 * Stop recording
 */
export const stopRecording = async (streamId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${VIDEOSDK_API_BASE}/streams/${streamId}/recording/stop`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to stop recording");
    }
  } catch (error) {
    console.error("Error stopping recording:", error);
    throw error;
  }
};

export default {
  getVideoSDKToken,
  startStream,
  endStream,
  joinStream,
  leaveStream,
  getLiveStreams,
  startRecording,
  stopRecording,
};
