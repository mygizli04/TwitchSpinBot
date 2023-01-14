#!/bin/sh

# Do not execute this file manually!

cd piggify

mkdir tmp
cd tmp

mkdir src
cd src

mv ../../out .
cp ../../../package.json .
cp ../../../package-lock.json .
cp ../../../botToken.json .
cp ../../../channelToken.json .
cp ../../../.env .

cp ../../../out/wheel/rewards.json ./out/wheel/rewards.json

cd ..
cp ../start.bat .

# Zip all the files
zip -r piggy.zip .

mv piggy.zip ..

cd ..
rm -rf tmp