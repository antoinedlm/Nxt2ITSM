# nxt2itsm

Nexthink score to ITSM solutions (reworked)

Displays Nexthink scores per device in HTML.

The purpose of this package is to provide a connector between Nexthink engines and ITSM tooling, like TOPdesk. It is not limited to this ITSM platform, but the initial version is targeted for TOPdesk.

# Table of Content

- [Requirements](#requirements)
- [Usage](#usage)
- [Installation](#installation)
    - [Online Installation](#online-installation)
    - [Offline Installation](#offline-installation)
- [Configuration](#configuration)
    - [_.env_ file](#env-file)
    - [_properties.json_ file](#propertiesjson-file)
    - [Score files](#score-files)
    - [Certificates](#certificates)
- [Running the application](#running-the-application)

# Requirements

The Appliance on which this tool will be installed has the following hardware requirements:

- 2 CPU Cores
- 2 GB of RAM
- 20 GB of disk space

In term of connectivity, this Appliance needs to have access to:

- API of the Engine Appliance(s) (port 1671 if default was kept).
- Portal API to retrieve Engines.
- Remote Action API of the Portal Appliance.
- Identity Provider to send and receive claims

# Usage

Create a new tab in the ITSM tool and have it display the following link: "https://appliance_fqdn/device/device_name"

Where device_name is a Windows PC name in Nexthink. This must be configured in the ITSM tool.

The pattern in red, yellow and green colors will be derived from a score.xml file that must be available in all Nexthink engines and must be placed in the scores/ folder.

The score.xml may contain Nexthink Act links.

# Installation

The application is a nodejs application and can be installed on any OS with nodejs installed.

However the following installations instructions were done based on a Nexthink ISO.

If you are not familiar with CentOS firewalls, switch it off:
```
sudo systemctl disable firewalld
sudo systemctl stop firewalld
```
### Online installation

This guide admit that the installation from the /home/nexthink folder. If you are not in this folfder, move in it with the following command:
```
cd /home/nexthink/
```
Install the different necessary components:
```
sudo yum install git -y
```
Install pm2 and also download the different files from the git repository:
```
sudo npm -g install pm2
npm install jeromewyss/nxt2itsm-no-auth
```
Make sure pm2 will autostart after a reboot and start it now:
```
sudo pm2 startup systemd
sudo systemctl start pm2-root
```
The solution is now installed in /home/nexthink/node_modules/nxt2itsm. Go to the configuration section for the next steps.

### Offline installation

TODO

# Configuration

The configuration of the application is done by doing checking the following:

- [_.env_ file](#env-file)
- [_properties.json_ file](#propertiesjson-file)
- [Score files](#score-files)
- [Certificates](#certificates)

##### env file

The _.env_ contains a set of variables to ensure the application has all the necessary information to run correctly. The .env file provided is empty by default, but the application won't run if it isn't filled.

##### properties.json file

The _properties.json_ file contains the list of properties that are displayed in the property tab of the application. Some examples properties are set in the file. To add a new property, the format should be:
```
"name_of_nxql_field": [
    "display_name",
    "nxql_field_type"
]
```
If you wish to add dynamic field (category, remote action results), the format should be:
```
"#'dynamic field'": [
    "display_name",
    "enum"
]
```

- __name_of_nxql_field__ is the name of the field in the nxql datamodel
- __display_name__ is what will be displayed in the application for this field
- __nxql_field_type__ is the type of the field in the nxql datamodel
- __dynamic field__ is the name of the dynamic field

To find the right format for a __dynamic field__, use the nxql editor and run the following query:
```
(select #"" (from device))
```
The query will results in error and the editor will propose you the list of availables dynamic fields.

You can only use the __device's fields__ from the [NXQL data model](https://doc.nexthink.com/Documentation/Nexthink/latest/APIAndIntegrations/NXQLDataModel#device).

##### Score files

All score files need to be uploaded into the /scores folder.

Also, some transformation might be needed by some fields for the values to be displayed in a readable format. Add the _Format_ attribute to the _Input_ for which the values need to be transformed. Here is an example:
```
<Input Format="byte">
    <Field Name="total_ram" />
</Input>
```

There are several nxql type that needs a transformation to be displayed in a readable way. Here is a list:

- second
- millisecond
- microsecond
- byte
- mhz
- permill
- percent
- bps

If you added remote action to the documentation section of the scores, it is necessary to provide a name for them, otherwise the UID will be displayed instead. This can be done by adding the _Name_ attribute to the remote action:
```
<RemoteAction UID="364bd31c-39a3-4ee3-b4a6-c9e83d731707" Name="Trigger disk cleanup" />
```

##### Certificates

The certificates need to be put in place (or created if selfsigned) in the ssl/ folder. The files in this folder upon installation are simply examples.

You can have 3 files in the ssl/ folder: 

- the certificate file
- the associated key
- the bundle of CA certificates (optional)

The CA bundle should have the different intermediate certificates so that the full certificate chain can be trusted.

The name of the files, can be configured in the __.env__ file.

In case you need to generate self-signed certificate for the Appliance, you can use the following commands:
```
cd /home/nexthink/node_modules/nxt2itsm/ssl/
sudo rm -f *.pem
sudo openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem
```

# Running the application

Once the configuration is done, start pm2 and then the app.js from the /home/nexthink/node_modules/nxt2itsm folder with the following commands:
```
cd /home/nexthink/node_modules/nxt2itsm
sudo pm2 start nxt2itsm-pm2.json
sudo pm2 save
``` 

The log files are automatically created in the same folder. However if you want to change the path of the log file or their name, you can edit the __nxt2itsm-pm2.json__ file

The following commands can help for troubleshooting too:

- `pm2 list` -> show the list of application running under pm2
- `pm2 show id` -> replace "id" by the id from the list command to see the details of the specific application
- `pm2 restart id` -> to restart a specific application
