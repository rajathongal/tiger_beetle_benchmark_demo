# Tiger_beetle_simulation (In progress)

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

Currently a demo project is included in the `index.js` file which can be run by using the below command

```console
node index.js
```
