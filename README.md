Kue module was used for creating a job queue and processing jobs in the background. 

Kue is backed by Redis so before moving on, please ensure that Redis is installed and a redis-server is running on your system.

-Launch Redis after computer starts: $ ln -sfv /usr/local/opt/redis/*.plist ~/Library/LaunchAgents

-Start Redis server via “launchctl”: $ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist

-Install dependencies: $ npm install

-Run server: $ node server.js

-Go to http://localhost:8080/create?html=http://www.google.com to start a job and retrieve a job ID (it takes 10 seconds to "complete" a job, within this time there'll be a pending response in the next step)

-Use the job ID given by the previous step and go to http://localhost:8080/job?id={job id} to see status or result 