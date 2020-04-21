## To get started on the lambda function, update setup-env.sh with your secrets then run:

```
$ python3 -m venv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ source setup-env.sh
$ python3 -m lambda.test_lambda
```


## To run the tests, you need to have node installed, then run:

```
node src/helpersSpec.js
```
