# Bytemark Dashboards (bmdash)

Bytemark's Dashboard Software

## About
Status screens, TV's flashing numbers and annoying noises! What is going on at
Bytemark, well let's look at the Dashboards!

`bmdash` attempts to be a simple and not at all complexing and vexing dashboard 
system that allows users to easily add and manage multiple dashboards, as well 
as making it easy to extend. Hahahaha, I will let you be the judge of our 
success.

## How to use

TODO:: Write software, then write about how to use it

## Development And Hacking

Bundle install prerequisites:
* Ruby 2.1 & development headers
* zlib development libraries (zlib1g-dev on debian)
* compilers n stuff (build-essential on debian)
* Maybe liblzma-dev

For testing, you'll also need these debian packages: qt5-default libqt5webkit5-dev gstreamer1.0-plugins-base gstreamer1.0-tools gstreamer1.0-x

Install all those, then make sure ruby 2.1 is your current ruby.
For debian, the command to install all prereqs is `apt-get install bundler ruby ruby-dev zlib1g-dev build-essential liblzma-dev`

Gems can be installed with `bundle install --without test`, or if you installed all the test dependencies you can leave off the `--without test`

`rackup -p 8080` to start the server.

Alternatively, vagrant:
For some ease, [Vagrant][0], [VirtualBox][1] and [Ansible][2] are used to make a
development envrioment you can use with almost minimal effort. You will also 
need to install the [Oracle VM VirtualBox Extension Pack][3] (or really you
could not setup USB devies on the VM, your call).

Once you have installed all of these, in the cloned git project run:

    $ vagrant up

This will download a Debian Jessie image, setup a VM and install all the 
software you need to run the application. The software doesn't auto run yet so
you need to do the following to get it started:

    $ vagrant ssh
    vagrant@dash-dev:~$ cd /vagrant
    vagrant@dash-dev:~$ rackup -p 8080 -o 0.0.0.0 config.ru

Then in your browser you can access 10.0.0.123:8080 to see the dev dashboard

To find out more about how it all works please refer to `docs/`

## Contact 

Sherman - He will be hiding under the table
sherman@bytemark.co.uk

[0]: https://docs.vagrantup.com/v2/why-vagrant/index.html 
[1]: https://www.virtualbox.org/
[2]: http://www.ansible.com/home 
[3]: http://www.oracle.com/technetwork/server-storage/virtualbox/downloads/index.html