find *.wav -exec ffmpeg -y -i '{}'  -codec:a libmp3lame -b:a 96k '{}.mp3' \;
find *.wav -exec ffmpeg -y -i '{}'  -codec:a libvorbis -qscale:a 4 '{}.ogg' \;
find *.wav -exec ffmpeg -y -i '{}'  -codec:a libfdk_aac -b:a 96k '{}.aac' \;
for old in *.wav.*; do
    new=$(echo $old | sed -e 's/\.wav//')
    mv -v "$old" "$new"
done
rm -f ../app/sounds/*
cp *.{mp3,aac,ogg} ../app/sounds/

