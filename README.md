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

_Note:: Only tested on OSX_

For some ease, [Vagrant][0], [VirtualBox][1] and [Ansible][2] are used to make a
development envrioment you can use with almost minimal effort. You will also 
need to install the [Oracle VM VirtualBox Extension Pack][3]. Once you have 
installed all of these, in the cloned git project run:

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
paul.rose@bytemark.co.uk

[0]: https://docs.vagrantup.com/v2/why-vagrant/index.html 
[1]: https://www.virtualbox.org/
[2]: http://www.ansible.com/home 
[3]: http://www.oracle.com/technetwork/server-storage/virtualbox/downloads/index.html
