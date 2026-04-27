# Troubleshooting Video/Audio Call Issues

## "Requested device not found" Error

This error occurs when the browser cannot access your camera or microphone. Here are the solutions:

### Quick Fixes

1. **Check Browser Permissions**
   - Click the lock icon (🔒) in the address bar
   - Make sure Camera and Microphone are set to "Allow"
   - Refresh the page after changing permissions

2. **Close Other Applications**
   - Close Zoom, Teams, Skype, or other video apps
   - Close other browser tabs using camera/mic
   - Restart your browser

3. **Check Device Connections**
   - Make sure your camera/microphone is plugged in
   - Try unplugging and reconnecting USB devices
   - Check if the device works in other apps

4. **Browser-Specific Solutions**

   **Chrome/Edge:**
   - Go to `chrome://settings/content/camera`
   - Go to `chrome://settings/content/microphone`
   - Make sure your site is not blocked
   - Clear the "Blocked" list if needed

   **Firefox:**
   - Go to `about:preferences#privacy`
   - Scroll to "Permissions" → "Camera" and "Microphone"
   - Check permissions for your site

   **Safari:**
   - Go to Safari → Settings → Websites
   - Click "Camera" and "Microphone"
   - Set your site to "Allow"

### Advanced Solutions

#### Windows

1. **Check Windows Privacy Settings**
   ```
   Settings → Privacy → Camera
   Settings → Privacy → Microphone
   ```
   - Enable "Allow apps to access your camera"
   - Enable "Allow apps to access your microphone"
   - Enable for your browser specifically

2. **Update Drivers**
   - Open Device Manager
   - Find "Cameras" and "Audio inputs"
   - Right-click → Update driver

3. **Check if Device is Disabled**
   - Open Device Manager
   - Look for disabled devices (gray icon)
   - Right-click → Enable

#### macOS

1. **Check System Preferences**
   ```
   System Preferences → Security & Privacy → Camera
   System Preferences → Security & Privacy → Microphone
   ```
   - Check the box next to your browser

2. **Reset Permissions**
   ```bash
   # In Terminal
   tccutil reset Camera
   tccutil reset Microphone
   ```
   - Restart browser and grant permissions again

#### Linux

1. **Check Device Access**
   ```bash
   ls -l /dev/video*
   ls -l /dev/snd/*
   ```

2. **Add User to Video Group**
   ```bash
   sudo usermod -a -G video $USER
   sudo usermod -a -G audio $USER
   ```
   - Log out and log back in

### Testing Your Devices

1. **Browser Test**
   - Visit: https://webcamtests.com/
   - Or: https://www.onlinemictest.com/

2. **Check Available Devices**
   - Open browser console (F12)
   - Run:
   ```javascript
   navigator.mediaDevices.enumerateDevices()
     .then(devices => console.log(devices))
   ```

### Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| `NotFoundError` | No camera/mic found | Connect device, check drivers |
| `NotAllowedError` | Permission denied | Allow in browser settings |
| `NotReadableError` | Device in use | Close other apps |
| `OverconstrainedError` | Device doesn't meet requirements | App will retry with lower quality |
| `TypeError` | Browser not supported | Use Chrome, Firefox, or Edge |

### Still Not Working?

1. **Try Audio-Only Mode**
   - The app automatically falls back to audio-only if camera fails
   - You can still participate in the meeting

2. **Use Different Browser**
   - Try Chrome, Firefox, or Edge
   - Make sure browser is up to date

3. **Restart Computer**
   - Sometimes a restart fixes device conflicts

4. **Check Antivirus/Firewall**
   - Some security software blocks camera/mic access
   - Temporarily disable to test

5. **Use External Devices**
   - Try a USB webcam instead of built-in camera
   - Use USB headset instead of built-in mic

### For Developers

#### Test Media Access
```javascript
// Test camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Camera works!', stream);
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('Camera error:', err));

// Test microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone works!', stream);
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('Microphone error:', err));
```

#### Check Available Devices
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    const mics = devices.filter(d => d.kind === 'audioinput');
    console.log('Cameras:', cameras);
    console.log('Microphones:', mics);
  });
```

#### Request Permissions
```javascript
// Request both at once
navigator.mediaDevices.getUserMedia({ 
  video: true, 
  audio: true 
})
  .then(stream => {
    console.log('Permissions granted');
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => {
    console.error('Permission denied:', err);
  });
```

### Common Scenarios

#### Scenario 1: Works in Other Apps, Not in Browser
- **Solution**: Check browser permissions specifically
- Browser permissions are separate from system permissions

#### Scenario 2: Works in One Browser, Not Another
- **Solution**: Each browser has its own permissions
- Grant permissions in the browser you're using

#### Scenario 3: Worked Before, Stopped Working
- **Solution**: 
  1. Clear browser cache and cookies
  2. Reset permissions
  3. Restart browser

#### Scenario 4: External Camera Not Detected
- **Solution**:
  1. Unplug and replug the camera
  2. Try different USB port
  3. Update camera drivers
  4. Check if camera has power (LED light)

#### Scenario 5: Built-in Camera Not Working
- **Solution**:
  1. Check if camera is disabled in BIOS
  2. Update laptop drivers
  3. Check privacy shutter (some laptops have physical switch)

### Prevention Tips

1. **Always Use HTTPS**
   - Camera/mic only work on secure connections
   - Use `https://` not `http://`

2. **Keep Browser Updated**
   - Update to latest version
   - Enable automatic updates

3. **Test Before Important Meetings**
   - Join 5 minutes early
   - Test audio/video before meeting starts

4. **Have Backup Plan**
   - Keep phone ready for audio backup
   - Have alternative communication method

### Support Resources

- **Chrome Help**: https://support.google.com/chrome/answer/2693767
- **Firefox Help**: https://support.mozilla.org/en-US/kb/how-manage-your-camera-and-microphone-permissions
- **Safari Help**: https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac
- **WebRTC Troubleshooting**: https://webrtc.github.io/samples/

### Contact Support

If none of these solutions work:
1. Note the exact error message
2. Note your browser and version
3. Note your operating system
4. Take a screenshot of the error
5. Contact your IT support or system administrator
