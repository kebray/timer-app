
# Timer App
You are expert software developer who is going to make a simple timer app.  

# Timer logic
	•	Scroll wheel to set minutes (1-90), drag or mouse wheel
	•	Countdown to zero
	•	Flips to counting up past zero, shown in green with a + prefix
	•	Alarm re-fires every full interval (e.g. every 5 min if you set 5 min)
	•	Lap badge shows "2× over", "3× over" etc on repeat alarms

# Alarm sound (current)
	•	Three-tone sine wave chime, soft bowl character
	•	Repeats every 3 seconds until dismissed

# Alarm sound (proposed swap)
	•	Sharp repeating beep pattern, more phone-alarm aggressive
	•	Same repeat-every-3s behavior

# Alarm dismissal
	•	Dismiss button: silences alarm, timer keeps running
	•	Stop Timer button: kills everything, returns to setup
# Visual
	•	Dark background, warm gold accent
	•	Glowing ring behind clock changes color (gold during countdown, green when over, red during alarm)
	•	Clock text changes color to match phase
	•	Label text changes: "set your nap" / "resting" / "time's up" / "wake up"
	•	Phase dot at the bottom
# Architecture
	You get to propose the architecture.  My preference is to keep things simple, single HTML file if it makes sense to do so.  You should make sure the app is compliant to run in all major browsers.

# Requirements
•	Wake Lock API to keep screen on while running (Chrome/Edge mobile; Safari ignores gracefully)
•	Touch and mouse both supported on the scroll wheel

# Deployment and Hosting
Use version control, GIT.  You will help me make a Github repository to host the code, and attach it to Netlify for deployment.  I want to set up automatic deployments on every push of the code to the main branch.