find *.wav -exec ffmpeg -y -i '{}'  -codec:a libmp3lame -b:a 96k '{}.mp3' \;
find *.wav -exec ffmpeg -y -i '{}'  -codec:a libvorbis -qscale:a 4 '{}.ogg' \;
find *.wav -exec ffmpeg -y -i '{}'  -codec:a libfdk_aac -b:a 96k '{}.aac' \;
rm -f ../app/sounds/*
cp *.{mp3,aac,ogg} ../app/sounds/

