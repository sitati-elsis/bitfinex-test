### Running the app
1. Clone the git repo.

    ```bash
    git clone git@github.com:sitati-elsis/bitfinex-test.git
    ```

2. `cd` into the repo you have just cloned.
    ```bash
    cd bitfinex/
    ```
3. Install [grenache](https://github.com/bitfinexcom/grenache)
    ```bash
    npm i -g grenache-grape
    ```

4. Install project dependences
    ```
    npm install
    ```

5. Boot two grape servers
    ```
    grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
    grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
    ```

6. Bring up the node server
    ```
    node server.js
    ```

7. Bring up a client
    ```
    node client.js
    ```

8. Give the client inputs
    ```
     - Ask <amount> <price> or Bid <amount> <price>
    ```
9. You can bring up a second client and communicate with the server through it


10. [Here](https://drive.google.com/file/d/1EMn8Vl0RIP5t5O20QwDRO_Q2TVGkLmOr/view?usp=sharing) is a screen recording showing how I am interacting with the client and server components of the task. 




