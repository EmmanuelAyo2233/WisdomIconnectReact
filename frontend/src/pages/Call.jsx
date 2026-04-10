import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Clock, MoreVertical } from "lucide-react";
import axios from "axios";

// Ice servers for WebRTC
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const Call = () => {
  const { meetingId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [showHostMenu, setShowHostMenu] = useState(false);
  const [isTimeLow, setIsTimeLow] = useState(false);
  
  const [callDetails, setCallDetails] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  // 1. Verify Access
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // You might need to use the exact backend URL here if api config isn't imported.
        // Assuming your backend runs on PORT 5000:
        const token = localStorage.getItem("activeToken");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
        
        const res = await axios.get(`${API_URL}/call/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.status === "success") {
          setHasAccess(true);
          setCallDetails(res.data.data);
          initializeCall();
        }
      } catch (err) {
        console.error("Access denied:", err);
        setCallStatus(err.response?.data?.message || "Unauthorized access.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      verifyAccess();
    }
  }, [meetingId, user]);

  // Handle local internet dropping (Socket explicitly disconnecting)
  useEffect(() => {
     if (!socket) return;
     
     const onDisconnect = () => {
         setCallStatus("Reconnecting...");
     };
     const onConnect = () => {
         setCallStatus("Live - Reconnected");
         // Rejoin the network room so the other person knows we are back
         socket.emit("joinRoom", {
            meetingId,
            userId: user?.id,
            role: user?.userType,
         });
     };

     socket.on("disconnect", onDisconnect);
     socket.on("connect", onConnect);

     return () => {
         socket.off("disconnect", onDisconnect);
         socket.off("connect", onConnect);
     };
  }, [socket, meetingId, user]);

  // 2. Initialize Call logic
  const initializeCall = async () => {
    setCallStatus("Live");
    try {
      // Setup Local Media safely
      let stream = null;
      try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
      } catch (mediaError) {
          console.warn("Could not acquire media, skipping local stream:", mediaError);
          // Don't crash, let WebRTC and sockets connect even if camera is locked by another browser
      }

      // Setup Peer Connection
      const pc = new RTCPeerConnection(servers);
      pcRef.current = pc;

      // Add local tracks to PC if stream exists
      if (stream) {
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });
      }

      // Handle incoming remote track
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE Candidate
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", {
            meetingId,
            candidate: event.candidate,
          });
        }
      };

      // Configure Socket Events
      socket?.emit("joinRoom", {
        meetingId,
        userId: user.id,
        role: user.userType,
      });

      socket?.on("userJoined", async ({ userId }) => {
        setCallStatus("Live - User Joined");
        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { meetingId, offer });
      });

      socket?.on("offer", async (offer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { meetingId, answer });
      });

      socket?.on("answer", async (answer) => {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket?.on("ice-candidate", async (candidate) => {
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      });

      socket?.on("userLeft", () => {
         setCallStatus("Live - User Left");
         if (remoteVideoRef.current) {
             remoteVideoRef.current.srcObject = null;
         }
      });

      socket?.on("callEnded", () => {
         handleEndCall(false); // false means 'don't emit to all again'
      });

      socket?.on("forceMute", () => {
          const audioTrack = localStreamRef.current?.getTracks().find((track) => track.kind === "audio");
          if (audioTrack) {
              audioTrack.enabled = false;
              setIsMicOn(false);
          }
      });

      socket?.on("forceVideoOff", () => {
          const videoTrack = localStreamRef.current?.getTracks().find((track) => track.kind === "video");
          if (videoTrack) {
              videoTrack.enabled = false;
              setIsVideoOn(false);
          }
      });

    } catch (err) {
      console.error("Error initializing call:", err);
      setCallStatus("Failed to access Camera/Mic.");
    }
  };

  // Setup countdown
  useEffect(() => {
    if (!callDetails?.endTime || isCallEnded) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Calculate end date based on today's date + endTime string
      // NOTE: For more robustness, combining appointment Date + endTime is better.
      const [hrs, mins, secs] = callDetails.endTime.split(":");
      const endDate = new Date();
      endDate.setHours(hrs, mins, secs || 0, 0);

      const diffMs = endDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft("Session Ended");
        clearInterval(interval);
        handleEndCall(true); // Auto end call
      } else {
        const minsLeft = Math.floor(diffMs / 60000);
        const secsLeft = Math.floor((diffMs % 60000) / 1000);
        setTimeLeft(`${minsLeft}:${secsLeft < 10 ? '0' : ''}${secsLeft}`);

        // Trigger 10-minute warning
        if (diffMs <= 10 * 60 * 1000 && !isTimeLow) {
             setIsTimeLow(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [callDetails, isCallEnded]);

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getTracks().find((track) => track.kind === "video");
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getTracks().find((track) => track.kind === "audio");
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const handleEndCall = async (shouldEmit = true) => {
      setIsCallEnded(true);
      setCallStatus("Call Ended");

      if (shouldEmit) {
          socket?.emit("endCall", { meetingId });
      }

      // Stop local tracks
      if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Close PC
      if (pcRef.current) {
          pcRef.current.close();
      }

      socket?.off("offer");
      socket?.off("answer");
      socket?.off("ice-candidate");
      socket?.off("userJoined");
      socket?.off("userLeft");
      socket?.off("callEnded");
      socket?.off("forceMute");
      socket?.off("forceVideoOff");

      // Mark Complete via API if user is the HOST (mentor) or if auto completing
      if ((user?.userType === "mentor" && shouldEmit) || (user?.userType === "mentor" && timeLeft === "Session Ended")) {
          try {
             const token = localStorage.getItem("activeToken");
             const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
             await axios.patch(`${API_URL}/sessions/${callDetails.appointmentId}/complete`, {}, {
                 headers: { Authorization: `Bearer ${token}` }
             });
          } catch(e) {
              console.error("Could not automatically mark complete:", e);
          }
      }
  };

  const navigateBack = () => {
      const type = user?.userType || user?.role;
      navigate(`/${type}/bookings`);
  };

  const forceMenteeMute = () => {
      socket?.emit("forceMute", { meetingId });
  };

  const forceMenteeVideoOff = () => {
      socket?.emit("forceVideoOff", { meetingId });
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[#b2222] text-xl font-semibold">Loading session setup...</div>;
  }

  if (!hasAccess) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gray-200 p-6 text-center">
            <h1 className="text-3xl font-bold text-[#b2222] mb-4">Access Denied</h1>
            <p className="text-xl max-w-lg text-gray-400">{callStatus}</p>
            <button onClick={navigateBack} className="mt-8 px-6 py-3 bg-[#b2222] text-white rounded-xl shadow-lg hover:bg-red-800">
                Back to Bookings
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* Header Info */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
         <div className="bg-gray-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#b2222]/30 flex items-center space-x-3 text-white shadow-[#b2222]/10 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${callStatus.includes("Live") ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}></div>
            <span className="font-semibold text-sm">{callStatus}</span>
         </div>
         <div className={`bg-gray-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border ${isTimeLow ? 'border-red-500 shadow-red-500/50 animate-pulse' : 'border-[#b2222]/30 shadow-[#b2222]/10'} flex items-center space-x-2 text-white font-mono text-sm shadow-sm transition-all`}>
             <Clock size={16} className={isTimeLow ? "text-red-500" : "text-[#b2222]"} />
             <span className="font-bold tracking-wider">{timeLeft || '--:--'}</span>
         </div>
      </div>

      {/* 10 Minute Warning Banner */}
      {isTimeLow && !isCallEnded && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#b2222]/90 backdrop-blur-md px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-[0_0_25px_rgba(178,34,34,0.8)] z-30 flex items-center gap-2 border border-white/20 animate-bounce">
              ⚠️ Warning: Less than 10 minutes remaining!
          </div>
      )}

      {/* Fullscreen Video Layout */}
      <div className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0">
        
        {/* Remote Video (Full Screen) */}
        {!isCallEnded ? (
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                {!remoteVideoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 font-medium z-0 bg-gray-900 gap-4">
                        <div className="h-24 w-24 bg-gray-800 rounded-full animate-pulse flex items-center justify-center">
                            <Video size={32} className="text-gray-600" />
                        </div>
                        {callStatus.includes("Left") ? "User disconnected. Reconnecting..." : "Waiting for other person to join..."}
                    </div>
                )}
            </div>
        ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white p-6 text-center z-50 backdrop-blur-3xl bg-black/90">
                <div className="w-24 h-24 bg-[#b2222]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(178,34,34,0.3)]">
                   <PhoneOff size={48} className="text-[#b2222]" />
                </div>
                <h1 className="text-4xl font-black mb-4">Session Ended</h1>
                <p className="text-lg text-gray-300 mb-8 max-w-sm">
                   The call has been terminated. Mentors and mentees can continue managing this session from their bookings page.
                </p>
                <button onClick={navigateBack} className="px-8 py-4 bg-[#b2222] text-white rounded-full shadow-xl hover:bg-red-800 font-bold transition-all hover:scale-105 active:scale-95">
                    Return to Dashboard
                </button>
            </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {!isCallEnded && (
            <div className="absolute top-24 right-6 w-32 h-44 md:w-48 md:h-64 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#b2222]/50 z-30 hover:scale-105 transition-transform cursor-pointer">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }} // mirror local
              />
              {!isVideoOn && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500">
                      <VideoOff size={32} />
                  </div>
              )}
              {!isMicOn && (
                  <div className="absolute bottom-2 right-2 bg-[#b2222] text-white rounded-full p-1.5 shadow-[0_0_10px_rgba(178,34,34,0.5)]">
                      <MicOff size={14} />
                  </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-white font-bold text-[10px]">
                  You
              </div>
            </div>
        )}
      </div>

      {/* Controls Bar */}
      {!isCallEnded && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-3xl border border-gray-800 px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 flex-wrap justify-center w-[90%] max-w-fit ring-1 ring-[#b2222]/10">
            
            <button 
                onClick={toggleMic}
                className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-[#b2222]/20 hover:bg-[#b2222]/40 text-[#b2222]'}`}
                title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
            >
                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            <button 
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-[#b2222]/20 hover:bg-[#b2222]/40 text-[#b2222]'}`}
                title={isVideoOn ? "Turn off camera" : "Turn on camera"}
            >
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            {/* Host Controls for Mentor */}
            {user?.userType === 'mentor' && (
                <div className="relative">
                    <button 
                        onClick={() => setShowHostMenu(!showHostMenu)}
                        className={`p-4 rounded-full transition-all ${showHostMenu ? 'bg-[#b2222] text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                        title="Host Controls"
                    >
                        <MoreVertical size={24} />
                    </button>

                    {showHostMenu && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 ring-1 ring-[#b2222]/30">
                            <div className="px-4 py-3 bg-black border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                                Host Actions
                            </div>
                            <button 
                                onClick={() => { forceMenteeMute(); setShowHostMenu(false); }}
                                className="px-4 py-4 text-left hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm text-gray-200 border-b border-gray-800"
                            >
                                <MicOff size={18} className="text-[#b2222]" /> Force Mute Mentee
                            </button>
                            <button 
                                onClick={() => { forceMenteeVideoOff(); setShowHostMenu(false); }}
                                className="px-4 py-4 text-left hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm text-gray-200"
                            >
                                <VideoOff size={18} className="text-[#b2222]" /> Stop Mentee Video
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="w-px h-10 bg-gray-700 mx-2"></div>

            <button 
                onClick={() => handleEndCall(true)}
                className="px-6 py-4 bg-[#b2222] hover:bg-red-800 rounded-full text-white shadow-[0_0_15px_rgba(178,34,34,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold"
                title={user?.userType === 'mentor' ? "End Call for Everyone" : "Leave Call"}
            >
                <PhoneOff size={24} />
                <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
      )}

    </div>
  );
};

export default Call;
