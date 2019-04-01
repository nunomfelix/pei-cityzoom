sudo service network-manager stop
sudo ifconfig wlp3s0 down
sudo iwconfig wlp3s0 essid "RBPIOTCNet" channel 1 mode Ad-Hoc
sudo ifconfig wlp3s0 192.168.15.2
sudo ifconfig wlp3s0 up
