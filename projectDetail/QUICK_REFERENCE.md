# WEConnect - Quick Reference Guide

## ⚡ Quick Start Code Examples

### 1. Setting Up Supabase Client

**In any server/component:**

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Use it
const { data, error } = await supabase.from("departments").select("*");
```

### 2. Using API Functions

```javascript
import * as API from "@/lib/supabase-api-extended";

// Send a message
const { data, error } = await API.sendMessage(
  deptId,
  userId,
  "Hello team!",
  null, // file (optional)
);

// Get messages in reverse order (newest first)
const messages = await API.getMessages(deptId, 50, 0);

// Create a task
const task = await API.createTask(deptId, userId, {
  title: "Review docs",
  description: "Check new documentation",
  priority: "high",
  assigned_to: otherUserId,
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
});

// Approve a request
await API.approveRequest(approvalId, managerId, {
  comments: "Approved for team",
});
```

### 3. Using Real-Time Hooks

```javascript
import { useChat, useMeeting, usePresence } from "@/hooks/useWebSocket";

// In your component
const MyComponent = () => {
  const { messages, sendMessage, typing } = useChat(departmentId);
  const { status, changeStatus, onlineUsers } = usePresence(orgId);

  const handleSendMessage = async (content) => {
    await sendMessage(content);
  };

  return (
    <div>
      {/* Typing indicator */}
      {typing.length > 0 && <p>{typing.length} typing...</p>}

      {/* Messages list */}
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}

      {/* Online users */}
      <p>Online: {onlineUsers.length}</p>

      {/* Status selector */}
      <select value={status} onChange={(e) => changeStatus(e.target.value)}>
        <option>online</option>
        <option>away</option>
        <option>busy</option>
      </select>

      {/* Send message */}
      <input
        onKeyPress={(e) => {
          if (e.key === "Enter") handleSendMessage(e.target.value);
        }}
      />
    </div>
  );
};
```

### 4. WebSocket Connection

```javascript
import { getSocket } from "@/hooks/useWebSocket";

// Get socket instance
const socket = getSocket();

// Listen to events
socket.on("send_message", (message) => {
  console.log("New message:", message);
});

// Emit event
socket.emit("send_message", {
  departmentId,
  content: "Hello!",
});

// Join a room (usually automatic in hooks)
socket.emit("join_department", departmentId);
```

### 5. WebRTC Video Call

```javascript
import { WebRTCPeerManager } from "@/lib/webrtc";

const webrtc = new WebRTCPeerManager({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

// Get local stream
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true,
});

// Create offer (caller side)
const offer = await webrtc.createOffer(peerId);
socket.emit("send_offer", { peerId, offer });

// Create answer (answerer side)
socket.on("receive_offer", async (offer) => {
  const answer = await webrtc.createAnswer(peerId);
  socket.emit("send_answer", { peerId, answer });
});

// Handle ICE candidates
socket.on("ice_candidate", async (candidate) => {
  await webrtc.addIceCandidate(candidate);
});

// Toggle audio
webrtc.toggleAudio(stream, false); // Mute

// Toggle video
webrtc.toggleVideo(stream, false); // Turn off camera

// Screen sharing
const screenStream = await webrtc.startScreenShare(stream);
socket.emit("screen_share", { peerId, stream: screenStream });
```

### 6. File Upload

```javascript
import * as API from "@/lib/supabase-api-extended";

const handleFileUpload = async (file) => {
  try {
    const result = await API.uploadFile(departmentId, userId, file);
    console.log("File uploaded:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

// In JSX
<input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />;
```

### 7. Database Subscription (Real-Time)

```javascript
// Real-time message updates
const subscription = supabase
  .from("messages")
  .on("*", (payload) => {
    console.log("Change received!", payload);
  })
  .subscribe();

// Cleanup on unmount
return () => subscription.unsubscribe();
```

## 📚 API Function Reference

### Messages

```javascript
sendMessage(deptId, senderId, content, file?)
getMessages(deptId, limit=50, offset=0)
deleteMessage(messageId)
updateMessage(messageId, content)
addReaction(messageId, userId, emoji)
removeReaction(messageId, userId, emoji)
createThread(parentMessageId, userId, content)
getThreads(parentMessageId)
```

### Tasks

```javascript
createTask(deptId, creatorId, {title, description, priority, assigned_to, due_date})
getTasks(deptId, filters?)
getTask(id)
updateTask(id, {status, priority, due_date})
deleteTask(id)
addTaskComment(taskId, userId, content)
getTaskComments(taskId)
assignTask(taskId, userId)
```

### Meetings

```javascript
createMeeting(deptId, organizerId, { title, description, scheduled_time });
getMeetings(deptId);
getMeeting(id);
updateMeeting(id, { status, webrtc_room_id });
deleteMeeting(id);
addParticipant(meetingId, userId);
removeParticipant(meetingId, userId);
updateParticipantStatus(meetingId, userId, status);
recordMeeting(meetingId, filePath);
endMeeting(meetingId);
```

### Attendance

```javascript
signIn(deptId, userId); // Returns entry with sign_in_time
signOut(deptId, userId); // Returns entry with sign_out_time
getAttendance(deptId, dateRange); // dateRange: { from, to }
```

### Approvals

```javascript
requestApproval(deptId, requesterId, {approval_type, title, description})
getApprovals(deptId, status?) // status: 'pending'|'approved'|'rejected'
approveRequest(approvalId, approverId, {comments})
rejectRequest(approvalId, approverId, {comments})
```

### Files

```javascript
uploadFile(deptId, uploaderId, file);
getFiles(deptId);
deleteFile(fileId);
downloadFile(fileId);
```

### Praise

```javascript
awardPraise(deptId, giverId, recipientId, message, badge?)
getPraise(deptId, recipientId)
```

### Presence

```javascript
updatePresence(userId, status, orgId); // status: 'online'|'away'|'busy'|'offline'
getPresence(orgId);
getOnlineUsers(deptId);
```

## 🎣 Hook API Reference

### useChat(departmentId)

```javascript
const { messages, typing, connected, sendMessage, startTyping, addReaction } =
  useChat(deptId);

// sendMessage(content, file?) -> Promise
// startTyping() -> void
// addReaction(messageId, emoji) -> Promise
```

### useMeeting(meetingId)

```javascript
const {
  participants,
  chatMessages,
  handsRaised,
  screenSharing,
  joinMeeting,
  raiseHand,
  shareScreen,
  toggleAudio,
  toggleVideo,
} = useMeeting(meetingId);

// joinMeeting() -> Promise
// raiseHand() -> void
// shareScreen(stream) -> Promise
// toggleAudio(enabled) -> void
// toggleVideo(enabled) -> void
```

### usePresence(organizationId)

```javascript
const { status, onlineUsers, changeStatus } = usePresence(orgId);

// changeStatus('online'|'away'|'busy'|'offline') -> void
```

### useWhiteboard()

```javascript
const { canvasData, participants, draw, clear } = useWhiteboard();

// draw(x, y, color) -> void
// clear() -> void
```

### useNotifications()

```javascript
const { notifications, markAsRead } = useNotifications();

// markAsRead(notificationId) -> void
```

## 🔧 Common Patterns

### Pattern: Load data on component mount

```javascript
useEffect(() => {
  const loadTasks = async () => {
    const data = await API.getTasks(departmentId);
    setTasks(data);
  };
  loadTasks();
}, [departmentId]);
```

### Pattern: Handle real-time updates

```javascript
const { messages } = useChat(departmentId);

useEffect(() => {
  // Messages already updated by hook
  console.log("New messages:", messages);
}, [messages]);
```

### Pattern: Form submission with error handling

```javascript
const handleCreateTask = async (formData) => {
  try {
    const task = await API.createTask(departmentId, userId, formData);
    setTasks([...tasks, task]);
    toast.success("Task created!");
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Pattern: Conditional rendering based on role

```javascript
{user.role === 'manager' && (
  <button onClick={() => API.approveRequest(...)}>
    Approve
  </button>
)}
```

## 🎨 Styling Examples

### Using Tailwind CSS

```jsx
<div className="bg-blue-50 p-4 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800">Meetings</h2>
  <p className="text-gray-600 mt-2">Manage your meetings</p>
</div>
```

### Responsive Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items here */}
</div>
```

## 🚨 Error Handling

```javascript
try {
  const data = await API.sendMessage(deptId, userId, content);
} catch (error) {
  if (error.code === "PGRST116") {
    console.log("Row not found");
  } else if (error.code === "42501") {
    console.log("Permission denied (RLS)");
  } else {
    console.log("Unknown error:", error.message);
  }
}
```

## 🔍 Debugging Tips

```javascript
// Debug: Check socket connection
console.log(getSocket().connected);

// Debug: Log all socket events
const socket = getSocket();
const originalEmit = socket.emit;
socket.emit = function (...args) {
  console.log("Emitting:", args[0]);
  return originalEmit.apply(socket, args);
};

// Debug: Check Supabase auth
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Current user:", user);

// Debug: Check RLS issues
// Open Supabase dashboard → Execution logs → Check for RLS errors
```

## 📱 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001

# Optional
NEXT_PUBLIC_STUN_SERVERS=["stun:stun.l.google.com:19302"]
NODE_ENV=development
```

---

**Quick Ref Version**: 1.0 | **Last Updated**: 2024
