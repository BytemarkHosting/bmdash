# -*- mode: ruby -*-
# vi: set ft=ruby :
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "ARTACK/debian-jessie"
  config.vm.hostname = "dash-dev"
  config.vm.network "private_network", ip: "10.0.0.123"

  config.vm.provider "virtuabox" do |v|
        v.gui = true
  end

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "ansible/dev.bmdash.playbook.yml"
    ansible.verbose = 'v'
  end

end
