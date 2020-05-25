# RC-Car
A repository for the RC Car project. 

**Project Summary:**
This project uses a Raspberry Pi to control the RC Car over Wi-Fi. The car has a camera module that is used to stream video to a browser on a computer. The RC car is intended to be controlled using a computer with a keyboard. The following keys can be pressed to control the car: 
- "W" -> forward
- "S" -> reverse
- "D" -> hard right
- "A" -> hard left
- "W+D" -> soft right
- "W+A" -> soft left
- no keys pressed -> stop
- "+" -> increase speed
- "-" -> decrease speed

**Setup on Raspberry Pi:**
1) Follow the instructions on this website to flash the Lite version of Raspbian (headless setup): https://desertbot.io/blog/headless-raspberry-pi-4-ssh-wifi-setup . Don't bother installing Bonjour as instructed.
2) Install motion for video streaming: https://raspberry-valley.azurewebsites.net/Streaming-Video-with-Motion/ . Note that the motion.conf file may not appear exactly the same and variables may have different names. Here is a list of all the changes I made to the motion.conf file (in nano editor, use CNTL+W and ALT+W for keyword search):
   - changed daemon changed from off to on
   - changed stream_localhost from on to off (used to be called webcam_localhost)
   - stream_port left at 8081 (change if you want)
   - changed webcontrol_localhost from on to off 
   - webcontrol_port left at 8080  (used to be called control_port, change if you want)
   - changed framerate to 30
   - changed stream_maxrate to 30
   - changed rotate from 0 to 180 (depending on how the camera module is mounted)
   - changed quality from 75 to 25
   - changed stream_quality from 50 to 25
3) To test out motion video streaming, go to a browser such as Google Chrome, and type: "raspberrypi.8081". If that doesn't work, try manually writing out the IP address of the Raspberry Pi instead of using the hostname. Use the port that is specified in motion.conf. 
4) Enable remote GPIO:
   - "sudo raspi-config" -> "Interfacing Options" -> Enable remote GPIO
   - reboot to make sure changes take effect 
5) 
