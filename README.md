# gulp-example
This repository is a simple Gulp example integrating Bower, jQuery Custom, Twitter Bootstrap 3, Magnific Popup, Font Awesome, Font Custom, Sprites and Twig.

## Installation
At first, clone this repository to the location of your choice. Then install required dependencies by:
```sh
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install nodejs librsvg2-bin phantomjs build-essential ruby1.9.1-dev fontforge zlib1g-dev
sudo npm install gulp bower ttf2eot ttf2woff otf2ttf -g
wget http://people.mozilla.com/~jkew/woff/woff-code-latest.zip
unzip woff-code-latest.zip -d sfnt2woff && cd sfnt2woff && make && sudo mv sfnt2woff /usr/local/bin/
gem install fontcustom
gem install scss_lint
gem install scss_lint_reporter_checkstyle
```

Then, install all Bower and NPM dependencies by moving to the cloned folder and run the install routines:
```sh
sudo npm install
bower install
```

Now you can make a frontend build by the following command (See gulp.js for included tasks):
```sh
gulp
```

## Note
This repo is not finished and will be completed.