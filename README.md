# Tiger_beetle_simulation

Tech used

- Nodejs `v16.20.2`
- Docker.
- Tiger Beetle Database.
- Grafana K6 for load testing.
- Pino for Logging.

## Running a single node cluster

- Run the below command and makes sure to have docker installed and setup locally.

```console
npm run prepare:tigerbeetle
```

This will create a data folder in the current directory.

- Run the below command to start the tiger beetle server

```console
npm run start:tigerbeetle
```

- For any issues occuring while using on docker desktop please apply the below solution

Go to docker desktop > setting > Docker Engine and add the below scripts, and make sure there are no trailing commas

```JSON
  "default-ulimits": {
    "memlock": {
      "Hard": -1,
      "Name": "memlock",
      "Soft": -1
    }
  }
```

Now delete data folder and restart docker and try again.

## Running the server

```console
npm install

npm run start:server
```

## Running the Benchmark

The benchmarking is done using Grafana's K6 testing tool. This requires installation of the K6.

Installation guide [link](https://k6.io/docs/get-started/installation/).

Running the benchmark

```console
k6 run k6.test.js   
```

Feel free to adjust the options of K6 in k6.test.js file. It looks something like below.

```javascript
export const options = {
  vus: 1000,
  duration: "10s",
};
```
