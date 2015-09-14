# Yera

Yera is a reactive programming language that compiles to javascript.
it was part of the futhark project.

## Prerequistites

1. [Gambit](http://gambitscheme.org/wiki/index.php/Main_Page) correctly set up
1. download and install [ansuz-gambit](https://github.com/francesco-bracchi/ansuz-gambit)
and [ehwas-gambit](https://github.com/francesco-bracchi/ehwas-gambit)

## Download

download source from github

    git clone git@github.com:francesco-bracchi/yera-gambit.git

## Install

    cd yera-gambit;
    make;
    sudo make install;

## Run
g
An example can be found in *test/serve.scm* file.
Currently all the runtime libs have to be loaded separately.

## Test

run `make test` this will open a web server at http://localhost:6080
