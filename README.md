# Tiger_beetle_simulation

## Project Details

This challenge is designed to test your ability to deal with a completely new technology (in this case TigerBeetle) and your ability to do research into things you’ve probably never dealt with.

TigerBeetle is a new open source database that has been primarily built for financial transactions.


They claim to do 800K txn/sec, we want to see how true that is!

Visa currently has capacity to process 50K/txn per second
Stripe - a global leader in payments handled over 27K txn/second

In order to test the claims of TigerBeetle, your task is to:

1. **Create a micro-payments system, with the following subtask:**

- Setup TigerBeetle either on [localhost](http://localhost) or on your preferred cloud.
- Intialize two users X and Y with an intial balance of 100 each.

Next
Implement a transactions engine that has the following parameters

- A signing mechanism Public Key to associate the balance and a Private Key to sign the transaction. (Choose your preferred signing algorithm)
- Create endpoints to send a transactions with micro-payments such as 0.01 and even lesser, which are digitally signed { i.e, a user sends a transaction which is signed by a particular private key }

Next

- Set up a backend server which verifies these transactions, checks there is no double spending { hence we need a nonce in transaction format }, and then does the transfer to the other account. [Do your own research on how blockchain payment systems enables transactions using NONCE and implement a simplified transaction scheme]
- Benchmark this system, to check how many transactions per second it can do!

Log the results and show us your code.

## Tech used

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
