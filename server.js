var http = require('http');
	fs = require('fs'),
	kue = require('kue'),
	jobs = kue.createQueue();

function getJobData(id) {

    return new Promise(function(resolve, reject) {

    	kue.Job.get(id, function(err, job){
    		if (err) reject(url);
    		resolve(job.data);
    	});
    });
}

function fetchUrl(url) {

	return new Promise((resolve, reject) => {

		http
		.get(url, (response) => {

			var body = [];

			if (response.statusCode < 200 || response.statusCode > 299) {
				reject(new Error('Failed to load page, status code: ' + response.statusCode)); // handle http errors
			}

			response.on('data', (chunk) => {
				body.push(chunk);
			});
			
			response.on('end', () => {

				body = Buffer.concat(body).toString();
				resolve(body); // we are done, resolve promise with only with results array
			});
		})
		.on('error', (err) => reject(err)); // handle connection errors of the request
	});
}

function createJob(url) {

    return new Promise(function(resolve, reject) {

		var job = jobs.create('scrape', {
		    "url": url,
		    "status": "pending", 
		    "html": ''
		});

		jobs.process('scrape', function(job, done) {
			
			url ? resolve(job.id) : reject(job.id);

			/* carry out all the job function here */
			setTimeout(function() {
				fetchUrl(url).then(function(html_data) { 

					kue.Job.get(job.id, function(err, job) {
					  	job.data.status = 'complete'; // change job properties
					  	job.data.html = html_data; // change job properties
					  	job.update(); // save changes
					});
					done(); 
				});
			}, 10000)
		});

		job
		.on('complete', function() {
			console.log('Job', job.id, 'for url', job.data.url, 'is done');
		})
		.on('failed', function () {
			console.log('Job', job.id, 'for url', job.data.url, 'has failed');
		});

		job.save();
    });
}

http.createServer(function(request, response) {

	request.on('error', function(err) {
		console.error(err);
		response.statusCode = 400;
		response.end();
	});

	var param = request.url.slice(request.url.indexOf('=') + 1);

	if (request.method === 'GET' && request.url === '/create?html=' + param) {

		createJob(param).then(function(id) {
		    response.end('<html><body><h1>Processing '+ param +' your job id: '+ id +' </h1></body></html>');
		})		
	} 
	else if (request.method === 'GET' && request.url === '/job?id=' + param) {

		getJobData(param).then(function(result) {

			if (result.status === 'pending') response.end('<html><body><h1>Status for '+ param +' is pending please check back later</h1></body></html>');
			response.end(result.html);
		})	
	} 
	else {
		response.statusCode = 404;
		response.end();
	}
}).listen(8080);